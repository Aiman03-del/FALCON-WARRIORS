// Validation utilities for forms

export type ValidationRule = {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => string | true;
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export const VALIDATION_RULES = {
  // Text fields
  required: (fieldName: string): ValidationRule => ({
    required: `${fieldName} is required`,
  }),
  
  minLength: (length: number, fieldName: string): ValidationRule => ({
    minLength: { value: length, message: `${fieldName} must be at least ${length} characters` },
  }),
  
  maxLength: (length: number, fieldName: string): ValidationRule => ({
    maxLength: { value: length, message: `${fieldName} must not exceed ${length} characters` },
  }),

  // Email validation
  email: (): ValidationRule => ({
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Please enter a valid email address",
    },
  }),

  // URL validation
  url: (): ValidationRule => ({
    pattern: {
      value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      message: "Please enter a valid URL",
    },
  }),

  // Number validation
  number: (fieldName: string): ValidationRule => ({
    pattern: {
      value: /^\d+$/,
      message: `${fieldName} must be a number`,
    },
  }),

  // Date validation
  date: (): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const date = new Date(value);
      return isNaN(date.getTime()) ? "Please enter a valid date" : true;
    },
  }),

  // Future date validation
  futureDate: (): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const date = new Date(value);
      return date > new Date() ? true : "Date must be in the future";
    },
  }),
};

// Validate a single field
export function validateField(value: any, rules: ValidationRule | ValidationRule[]): ValidationResult {
  const ruleArray = Array.isArray(rules) ? rules : [rules];

  for (const rule of ruleArray) {
    // Required validation
    if (rule.required) {
      if (!value || (typeof value === "string" && !value.trim())) {
        return {
          isValid: false,
          error: typeof rule.required === "string" ? rule.required : "This field is required",
        };
      }
    }

    // Min length validation
    if (rule.minLength && value) {
      if (String(value).length < rule.minLength.value) {
        return { isValid: false, error: rule.minLength.message };
      }
    }

    // Max length validation
    if (rule.maxLength && value) {
      if (String(value).length > rule.maxLength.value) {
        return { isValid: false, error: rule.maxLength.message };
      }
    }

    // Pattern validation
    if (rule.pattern && value) {
      if (!rule.pattern.value.test(String(value))) {
        return { isValid: false, error: rule.pattern.message };
      }
    }

    // Custom validation
    if (rule.validate && value) {
      const result = rule.validate(value);
      if (result !== true) {
        return { isValid: false, error: result };
      }
    }
  }

  return { isValid: true };
}

// Validate multiple fields at once
export function validateForm(
  data: Record<string, any>,
  schema: Record<string, ValidationRule | ValidationRule[]>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const result = validateField(data[field], rules);
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    }
  }

  return errors;
}

// Field-specific validators
export const fieldValidators = {
  tournamentName: [
    VALIDATION_RULES.required("Tournament Name"),
    VALIDATION_RULES.minLength(3, "Tournament Name"),
    VALIDATION_RULES.maxLength(100, "Tournament Name"),
  ],

  matchDate: [
    VALIDATION_RULES.required("Match Date"),
    VALIDATION_RULES.futureDate(),
  ],

  newsTitle: [
    VALIDATION_RULES.required("News Title"),
    VALIDATION_RULES.minLength(5, "News Title"),
    VALIDATION_RULES.maxLength(200, "News Title"),
  ],

  newsContent: [
    VALIDATION_RULES.required("News Content"),
    VALIDATION_RULES.minLength(20, "News Content"),
    VALIDATION_RULES.maxLength(5000, "News Content"),
  ],

  categoryTag: [
    VALIDATION_RULES.required("Category"),
  ],

  playerUsername: [
    VALIDATION_RULES.required("Player Username"),
    VALIDATION_RULES.minLength(3, "Player Username"),
    VALIDATION_RULES.maxLength(50, "Player Username"),
  ],

  score: [
    VALIDATION_RULES.required("Score"),
    VALIDATION_RULES.number("Score"),
  ],
};
