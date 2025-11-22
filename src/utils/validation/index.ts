// Centralized validation utilities for all forms
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export class FormValidator {
  private rules: Record<string, ValidationRule> = {};

  addRule(field: string, rule: ValidationRule) {
    this.rules[field] = rule;
  }

  validate(data: Record<string, any>): ValidationErrors {
    const errors: ValidationErrors = {};

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];
      const error = this.validateField(value, rule, field);
      if (error) {
        errors[field] = error;
      }
    }

    return errors;
  }

  private validateField(value: any, rule: ValidationRule, field: string): string | null {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${this.getFieldLabel(field)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // String length validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${this.getFieldLabel(field)} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${this.getFieldLabel(field)} must be no more than ${rule.maxLength} characters`;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `${this.getFieldLabel(field)} must be at least ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return `${this.getFieldLabel(field)} must be no more than ${rule.max}`;
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${this.getFieldLabel(field)} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      titleJp: 'Japanese Title',
      title: 'Title',
      description: 'Description',
      levelJlpt: 'JLPT Level',
      estimatedTimeMinutes: 'Estimated Time',
      estimatedTime: 'Estimated Time',
      lessonOrder: 'Lesson Order',
      questionCount: 'Question Count',
      version: 'Version',
      lessonCategoryId: 'Lesson Category',
      rewardId: 'Reward ID',
      type: 'Type',
      difficulty: 'Difficulty',
      isActive: 'Active Status',
      isPublished: 'Published Status',
      lessonId: 'Lesson',
      items: 'Items',
      'translation_0': 'Vietnamese Translation',
      'translation_1': 'English Translation',
    };
    return labels[field] || field;
  }
}

// Predefined validation rules for common form fields
export const commonValidationRules = {
  title: { required: true, minLength: 1, maxLength: 255 },
  titleJp: { required: true, minLength: 1, maxLength: 255 },
  description: { required: true, minLength: 10, maxLength: 1000 },
  levelJlpt: { required: true, min: 1, max: 5 },
  estimatedTimeMinutes: { required: true, min: 1, max: 300 },
  estimatedTime: { required: true, min: 1, max: 300 },
  lessonOrder: { required: true, min: 1, max: 999 },
  questionCount: { required: true, min: 1, max: 100 },
  version: { 
    required: true, 
    pattern: /^\d+\.\d+\.\d+$/,
    custom: (value: string) => {
      if (!/^\d+\.\d+\.\d+$/.test(value)) {
        return 'Version must be in format x.y.z (e.g., 1.0.0)';
      }
      return null;
    }
  },
  lessonCategoryId: { required: true, min: 1 },
  rewardIds: { required: true, min: 1, custom: (value: any[]) => {
    if (!Array.isArray(value) || value.length === 0) {
      return 'Phải chọn ít nhất một phần thưởng';
    }
    return null;
  } },
  type: { required: true },
  difficulty: { required: true },
  lessonId: { required: true, min: 1 },
  items: { 
    required: true, 
    custom: (value: any[]) => {
      if (!Array.isArray(value) || value.length === 0) {
          return 'Phải chọn ít nhất một item';
      }
      return null;
    }
  },
  translation: {
    required: true,
    minLength: 1,
    maxLength: 255
  }
};

// Validation functions for specific forms
export const validateCreateLesson = (data: any): ValidationErrors => {
  const validator = new FormValidator();
  
  validator.addRule('titleJp', commonValidationRules.titleJp);
  validator.addRule('levelJlpt', commonValidationRules.levelJlpt);
  validator.addRule('estimatedTimeMinutes', commonValidationRules.estimatedTimeMinutes);
  validator.addRule('version', commonValidationRules.version);
  validator.addRule('lessonCategoryId', commonValidationRules.lessonCategoryId);
  validator.addRule('rewardIds', commonValidationRules.rewardIds);
  
  // Validate translations
  if (data.translations?.meaning) {
    data.translations.meaning.forEach((translation: any, index: number) => {
      if (!translation.value?.trim()) {
        validator.addRule(`translation_${index}`, commonValidationRules.translation);
      }
    });
  }

  return validator.validate(data);
};

export const validateCreateExercise = (data: any): ValidationErrors => {
  const validator = new FormValidator();
  
  validator.addRule('title', commonValidationRules.title);
  validator.addRule('description', commonValidationRules.description);
  validator.addRule('type', commonValidationRules.type);
  validator.addRule('difficulty', commonValidationRules.difficulty);
  validator.addRule('questionCount', commonValidationRules.questionCount);
  validator.addRule('estimatedTime', commonValidationRules.estimatedTime);
  validator.addRule('lessonId', commonValidationRules.lessonId);

  return validator.validate(data);
};

export const validateCreateContent = (data: any): ValidationErrors => {
  const validator = new FormValidator();
  
  validator.addRule('items', commonValidationRules.items);

  return validator.validate(data);
};

// Real-time validation hook
export const useFormValidation = (rules: Record<string, ValidationRule>) => {
  const validator = new FormValidator();
  
  // Add all rules
  Object.entries(rules).forEach(([field, rule]) => {
    validator.addRule(field, rule);
  });

  const validate = (data: Record<string, any>) => {
    return validator.validate(data);
  };

  const validateField = (field: string, value: any) => {
    const rule = rules[field];
    if (!rule) return null;
    
    const error = validator['validateField'](value, rule, field);
    return error;
  };

  return { validate, validateField };
};
