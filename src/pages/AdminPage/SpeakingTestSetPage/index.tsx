import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/Select";
import { Switch } from "@ui/Switch";
import HeaderAdmin from "@organisms/Header/Admin";
import { ROUTES } from "@constants/route";
import { toast } from "react-toastify";
import { TestSetUpsertWithQuestionBanksRequest, QuestionBankForSpeaking } from "@models/testSet/request";
import { useUpsertTestSetWithQuestionBanks } from "@hooks/useTestSet";
import { useQuery } from "@tanstack/react-query";
import testSetService from "@services/testSet";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { Card } from "@ui/Card";
// helpers not needed for full-detail endpoint

// Removed old SortableMessage presentation in favor of inline editing UI
const SortableRow: React.FC<{ id: string; children: (bind: { attributes: React.HTMLAttributes<HTMLDivElement>; listeners: React.DOMAttributes<HTMLDivElement> }) => React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;
  const handleListeners = (listeners || {}) as unknown as React.DOMAttributes<HTMLDivElement>;
  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners: handleListeners })}
    </div>
  );
};

const SpeakingTestSetPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form, setForm] = useState<{
    meanings: Array<{
      field: "name" | "description";
      translations: { vi: string; en: string; ja: string };
    }>;
    audioUrl: string;
    price: number | null;
    levelN: number;
    testType: "SPEAKING";
    status: "DRAFT" | "ACTIVE" | "INACTIVE";
  }>({
    meanings: [
      { field: "name", translations: { vi: "", en: "", ja: "" } },
      { field: "description", translations: { vi: "", en: "", ja: "" } },
    ],
    audioUrl: "",
    price: null,
    levelN: 5,
    testType: "SPEAKING",
    status: "ACTIVE",
  });

  const [messages, setMessages] = useState<(QuestionBankForSpeaking & { _uniqueId?: string })[]>([]);
  const [uniqueIdCounter, setUniqueIdCounter] = useState(0);
  
  const upsertMutation = useUpsertTestSetWithQuestionBanks();

  // Fetch test set with full question banks (single endpoint)
  const { data: fullData, isLoading: loadingTestSet } = useQuery({
    queryKey: ["testset-with-question-banks-full", id],
    queryFn: () => testSetService.getTestSetWithQuestionBanksFull(Number(id!)),
    enabled: isEditMode && !!id,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  useEffect(() => {
    if (isEditMode && fullData?.data) {
      const d = fullData.data as {
        id: number;
        name: Array<{ vi?: string; en?: string; ja?: string }>;
        description: Array<{ vi?: string; en?: string; ja?: string }>;
        audioUrl?: string | null;
        price?: number | null;
        levelN: number;
        testType: "SPEAKING";
        status: "DRAFT" | "ACTIVE" | "INACTIVE";
        testSetQuestionBanks?: Array<{
          questionOrder?: number;
          questionBank: {
            id?: number;
            questionJp?: string;
            questionType?: string;
            audioUrl?: string | null;
            pronunciation?: string | null;
            role?: string;
            levelN?: number;
            meanings?: { vi?: string; en?: string; ja?: string };
          };
        }>;
      };

      const nameObj = d.name?.[0] || { vi: "", en: "", ja: "" };
      const descObj = d.description?.[0] || { vi: "", en: "", ja: "" };

      setForm({
        meanings: [
          { field: "name", translations: { vi: nameObj.vi || "", en: nameObj.en || "", ja: nameObj.ja || "" } },
          { field: "description", translations: { vi: descObj.vi || "", en: descObj.en || "", ja: descObj.ja || "" } },
        ],
        audioUrl: d.audioUrl || "",
        price: d.price ?? null,
        levelN: d.levelN,
        testType: d.testType,
        status: d.status,
      });

      const formattedMessages = (d.testSetQuestionBanks || [])
        .sort((a, b) => (a.questionOrder || 0) - (b.questionOrder || 0))
        .map((item, index) => {
          const qb = item.questionBank || ({} as NonNullable<typeof item>["questionBank"]);
          const meanings = qb.meanings
            ? [{ translations: { vi: qb.meanings.vi || "", en: qb.meanings.en || "", ja: qb.meanings.ja || "" } }]
            : [{ translations: { vi: "", en: "", ja: "" } }];
          return {
            id: qb.id,
            questionJp: qb.questionJp || "",
            questionType: (qb.questionType as "SPEAKING" | "VOCABULARY" | "GRAMMAR" | "KANJI" | "LISTENING" | "READING" | "GENERAL") || "SPEAKING",
            audioUrl: qb.audioUrl || null,
            role: (qb.role as "A" | "B") || "A",
            pronunciation: qb.pronunciation || null,
            levelN: qb.levelN || d.levelN,
            meanings,
            _uniqueId: qb.id ? `msg-${qb.id}` : `msg-temp-${Date.now()}-${index}`,
          } as (QuestionBankForSpeaking & { _uniqueId?: string });
        });

      setMessages(formattedMessages);
      setUniqueIdCounter(formattedMessages.length);
    }
  }, [isEditMode, fullData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keep each question's levelN in sync with the selected TestSet levelN
  useEffect(() => {
    setMessages(prev => prev.map(m => ({ ...m, levelN: form.levelN })));
  }, [form.levelN]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMessages((items) => {
        const oldIndex = items.findIndex(
          (item) => {
            const id = item._uniqueId || (item.id ? `msg-${item.id}` : null);
            return id === active.id;
          }
        );
        const newIndex = items.findIndex(
          (item) => {
            const id = item._uniqueId || (item.id ? `msg-${item.id}` : null);
            return id === over.id;
          }
        );
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  }, []);

  const addInlineMessage = () => {
    const newId = `msg-new-${Date.now()}-${uniqueIdCounter}`;
    setUniqueIdCounter((prev) => prev + 1);
    setMessages([
      ...messages,
      {
        questionJp: "",
        questionType: "SPEAKING",
        role: "A",
        pronunciation: "",
        levelN: form.levelN,
        meanings: [
          {
            translations: { vi: "", en: "", ja: "" },
          },
        ],
        _uniqueId: newId,
      },
    ]);
  };

  const handleDeleteMessage = (index: number) => {
    if (confirm("Bạn có chắc muốn xóa câu này?")) {
      setMessages(messages.filter((_, i) => i !== index));
    }
  };

  // Memoize sortable items to ensure stable references
  const sortableItems = useMemo(() => 
    messages.map((m, idx) => {
      if (m._uniqueId) return m._uniqueId;
      if (m.id) return `msg-${m.id}`;
      return `msg-temp-${idx}`;
    }),
    [messages]
  );

  const handleSave = () => {
    const nameMeaning = form.meanings.find((m) => m.field === "name");
    if (!nameMeaning || !nameMeaning.translations.vi.trim()) {
      toast.error("Vui lòng nhập tên (vi)");
      return;
    }

    const body: TestSetUpsertWithQuestionBanksRequest = {
      ...(isEditMode && id ? { id: Number(id) } : {}),
      meanings: form.meanings,
      audioUrl: form.audioUrl || null,
      price: form.price ?? null,
      levelN: form.levelN,
      testType: form.testType,
      status: form.status,
      questionBanks: messages.map((msg) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _uniqueId, ...rest } = msg as typeof msg & { _uniqueId?: string };
        // ensure meanings has vi/en/ja keys
        const normalized = {
          ...rest,
          meanings: (rest.meanings && rest.meanings.length > 0)
            ? rest.meanings.map((m) => ({
                translations: {
                  vi: m.translations.vi || "",
                  en: m.translations.en || "",
                  ja: m.translations.ja || "",
                },
              }))
            : [{ translations: { vi: "", en: "", ja: "" } }],
        };
        return normalized;
      }),
    };

    upsertMutation.mutate(body, {
      onSuccess: () => {
        toast.success(isEditMode ? "Cập nhật thành công" : "Tạo mới thành công");
        navigate(ROUTES.MANAGER.TESTSET_MANAGEMENT);
      },
    });
  };

  if (loadingTestSet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <HeaderAdmin
        title={isEditMode ? "Chỉnh sửa Speaking Test" : "Tạo Speaking Test"}
        description="Quản lý bộ đề thi nói"
      />

      <div className="p-8 mt-24 max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.MANAGER.TESTSET_MANAGEMENT)}
          className="mb-4"
        >
          ← Quay lại
        </Button>

        {/* Test Set Form */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Thông tin Test Set</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Name (vi) *</label>
                <Input
                  value={form.meanings.find(m=>m.field==='name')!.translations.vi}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meanings: form.meanings.map((m) =>
                        m.field === 'name'
                          ? { ...m, translations: { ...m.translations, vi: e.target.value } }
                          : m
                      ),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Name (en)</label>
                <Input
                  value={form.meanings.find(m=>m.field==='name')!.translations.en}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meanings: form.meanings.map((m) =>
                        m.field === 'name'
                          ? { ...m, translations: { ...m.translations, en: e.target.value } }
                          : m
                      ),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Name (ja)</label>
                <Input
                  value={form.meanings.find(m=>m.field==='name')!.translations.ja}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meanings: form.meanings.map((m) =>
                        m.field === 'name'
                          ? { ...m, translations: { ...m.translations, ja: e.target.value } }
                          : m
                      ),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Description (vi)</label>
                <Input
                  value={form.meanings.find(m=>m.field==='description')!.translations.vi}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meanings: form.meanings.map((m) =>
                        m.field === 'description'
                          ? { ...m, translations: { ...m.translations, vi: e.target.value } }
                          : m
                      ),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (en)</label>
                <Input
                  value={form.meanings.find(m=>m.field==='description')!.translations.en}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meanings: form.meanings.map((m) =>
                        m.field === 'description'
                          ? { ...m, translations: { ...m.translations, en: e.target.value } }
                          : m
                      ),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (ja)</label>
                <Input
                  value={form.meanings.find(m=>m.field==='description')!.translations.ja}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meanings: form.meanings.map((m) =>
                        m.field === 'description'
                          ? { ...m, translations: { ...m.translations, ja: e.target.value } }
                          : m
                      ),
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Audio URL</label>
              <Input
                value={form.audioUrl}
                onChange={(e) =>
                  setForm({ ...form, audioUrl: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Có phí</label>
                <Switch
                  checked={!!form.price}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, price: checked ? 1 : null })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">LevelN</label>
                <Select
                  value={String(form.levelN)}
                  onValueChange={(v) =>
                    setForm({ ...form, levelN: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Tất cả cấp</SelectItem>
                    <SelectItem value="1">N1</SelectItem>
                    <SelectItem value="2">N2</SelectItem>
                    <SelectItem value="3">N3</SelectItem>
                    <SelectItem value="4">N4</SelectItem>
                    <SelectItem value="5">N5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      status: v as "DRAFT" | "ACTIVE" | "INACTIVE",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Conversation Messages */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Hội thoại</h3>
            <Button onClick={addInlineMessage}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm câu
            </Button>
          </div>

          <div className="min-h-[400px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-16">
                Chưa có câu nào. Nhấn "Thêm câu" để bắt đầu.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortableItems}
                  strategy={verticalListSortingStrategy}
                >
                  {messages.map((message, index) => {
                    const uniqueId = message._uniqueId || (message.id ? `msg-${message.id}` : `msg-temp-${index}`);
                    return (
                      <SortableRow id={uniqueId} key={uniqueId}>
                      {({ attributes, listeners }) => (
                      <div className={`mb-4 flex ${message.role === 'A' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`${message.role === 'A' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-xl px-3 py-3 w-full md:w-4/5 relative`}>
                        <div className={`absolute -top-2 ${message.role === 'A' ? '-right-2' : '-left-2'} w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold shadow-sm`}>
                            {message.role}
                          </div>

                          {/* 1) questionJp */}
                          <Input
                            value={message.questionJp}
                            placeholder="Câu tiếng Nhật"
                            onChange={(e) => {
                              const updated = [...messages];
                              updated[index] = { ...message, questionJp: e.target.value };
                              setMessages(updated);
                            }}
                            className={`${message.role === 'A' ? 'bg-white/10 border-white/20 text-white placeholder-white/70' : ''}`}
                          />

                          {/* 2) pronunciation */}
                          <div className="mt-2">
                            <Input
                              value={message.pronunciation || ''}
                              placeholder="Phiên âm / ふりがな"
                              onChange={(e) => {
                                const updated = [...messages];
                                updated[index] = { ...message, pronunciation: e.target.value || '' };
                                setMessages(updated);
                              }}
                              className={`${message.role === 'A' ? 'bg-white/10 border-white/20 text-white placeholder-white/70' : ''}`}
                            />
                          </div>

                          {/* 3) meanings (vi/en/ja) in one row */}
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Input
                              value={message.meanings?.[0]?.translations?.vi || ''}
                              placeholder="VI"
                              onChange={(e) => {
                                const updated = [...messages];
                                const meanings: NonNullable<QuestionBankForSpeaking['meanings']> = (message.meanings && message.meanings.length > 0)
                                  ? [...message.meanings]
                                  : [{ translations: { vi: '', en: '', ja: '' } }];
                                meanings[0] = {
                                  translations: {
                                    vi: e.target.value,
                                    en: meanings[0].translations.en || '',
                                    ja: meanings[0].translations.ja || '',
                                  },
                                };
                                updated[index] = { ...message, meanings } as QuestionBankForSpeaking & { _uniqueId?: string };
                                setMessages(updated);
                              }}
                              className={`${message.role === 'A' ? 'bg-white/10 border-white/20 text-white placeholder-white/70' : ''}`}
                            />
                            <Input
                              value={message.meanings?.[0]?.translations?.en || ''}
                              placeholder="EN"
                              onChange={(e) => {
                                const updated = [...messages];
                                const meanings: NonNullable<QuestionBankForSpeaking['meanings']> = (message.meanings && message.meanings.length > 0)
                                  ? [...message.meanings]
                                  : [{ translations: { vi: '', en: '', ja: '' } }];
                                meanings[0] = {
                                  translations: {
                                    vi: meanings[0].translations.vi || '',
                                    en: e.target.value,
                                    ja: meanings[0].translations.ja || '',
                                  },
                                };
                                updated[index] = { ...message, meanings } as QuestionBankForSpeaking & { _uniqueId?: string };
                                setMessages(updated);
                              }}
                              className={`${message.role === 'A' ? 'bg-white/10 border-white/20 text-white placeholder-white/70' : ''}`}
                            />
                            <Input
                              value={message.meanings?.[0]?.translations?.ja || ''}
                              placeholder="JA"
                              onChange={(e) => {
                                const updated = [...messages];
                                const meanings: NonNullable<QuestionBankForSpeaking['meanings']> = (message.meanings && message.meanings.length > 0)
                                  ? [...message.meanings]
                                  : [{ translations: { vi: '', en: '', ja: '' } }];
                                meanings[0] = {
                                  translations: {
                                    vi: meanings[0].translations.vi || '',
                                    en: meanings[0].translations.en || '',
                                    ja: e.target.value,
                                  },
                                };
                                updated[index] = { ...message, meanings } as QuestionBankForSpeaking & { _uniqueId?: string };
                                setMessages(updated);
                              }}
                              className={`${message.role === 'A' ? 'bg-white/10 border-white/20 text-white placeholder-white/70' : ''}`}
                            />
                          </div>

                          <div className="flex justify-between items-center mt-3">
                            <div className={`text-xs ${message.role === 'A' ? 'text-white/80' : 'text-gray-500'}`}>Level N: {message.levelN}</div>
                            <div className="flex gap-2 items-center">
                              <Select
                                value={message.role}
                                onValueChange={(v) => {
                                  const updated = [...messages];
                                  updated[index] = { ...message, role: v as 'A' | 'B' };
                                  setMessages(updated);
                                }}
                              >
                                <SelectTrigger className={`${message.role === 'A' ? 'bg-white/10 border-white/20 text-white' : ''} h-7`}> 
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A">A (Hệ thống)</SelectItem>
                                  <SelectItem value="B">B (Người dùng)</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMessage(index)}
                                className={`${message.role === 'A' ? 'text-white/90 hover:text-white' : 'text-red-600'} text-xs`}
                              >
                                Xóa
                              </Button>
                              <div className={`${message.role === 'A' ? 'text-white/80' : 'text-gray-400'} cursor-grab active:cursor-grabbing`} {...attributes} {...listeners}>
                                <GripVertical className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      )}
                      </SortableRow>
                    );
                  })}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.MANAGER.TESTSET_MANAGEMENT)}
          >
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={upsertMutation.isPending}>
            {upsertMutation.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>

        {/* Removed dialog; inline editing is now enabled for each message */}
      </div>
    </>
  );
};

export default SpeakingTestSetPage;

