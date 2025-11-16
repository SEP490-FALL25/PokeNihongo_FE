import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Badge } from "@ui/Badge";
import { BookOpen, Hash, FileQuestion } from "lucide-react";
import { QuestionEntityType } from "@models/questionBank/entity";

const StatsCards: React.FC<COMPONENTS.IStatsCardsProps> = ({ questions, totalItems }) => {
  const countByLevel = (level: number) => questions.filter((q: QuestionEntityType) => q.levelN === level).length;

  const stats = [
    {
      label: "Tổng câu hỏi",
      value: totalItems || 0,
      icon: BookOpen,
      gradient: "from-purple-500/10 to-pink-500/10",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/20"
    },
    {
      label: "Câu hỏi N5",
      value: countByLevel(5),
      icon: Hash,
      gradient: "from-green-500/10 to-emerald-500/10",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      borderColor: "border-green-500/20",
      badge: "N5",
      badgeColor: "bg-green-500/20 text-green-600 border-green-500/30"
    },
    {
      label: "Câu hỏi N4",
      value: countByLevel(4),
      icon: Hash,
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20",
      badge: "N4",
      badgeColor: "bg-blue-500/20 text-blue-600 border-blue-500/30"
    },
    {
      label: "Câu hỏi N3",
      value: countByLevel(3),
      icon: Hash,
      gradient: "from-yellow-500/10 to-amber-500/10",
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
      borderColor: "border-yellow-500/20",
      badge: "N3",
      badgeColor: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
    },
    {
      label: "Câu hỏi N2",
      value: countByLevel(2),
      icon: Hash,
      gradient: "from-orange-500/10 to-red-500/10",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      borderColor: "border-orange-500/20",
      badge: "N2",
      badgeColor: "bg-orange-500/20 text-orange-600 border-orange-500/30"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card 
          key={stat.label} 
          className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} border ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground/90">{stat.label}</CardTitle>
              <div className="flex items-center gap-2">
                {stat.badge && (
                  <Badge className={`${stat.badgeColor} shadow-sm font-medium text-xs`}>
                    {stat.badge}
                  </Badge>
                )}
                <div className={`p-2 rounded-lg ${stat.iconBg} ${stat.iconColor}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;


