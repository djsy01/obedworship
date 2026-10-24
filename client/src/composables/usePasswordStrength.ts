import { computed, type Ref } from "vue";

const SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;
const HAS_LETTER = /[a-zA-Z]/;
const HAS_NUMBER = /[0-9]/;

export type PasswordStrength = "danger" | "normal" | "strong" | "very-strong";

export const PASSWORD_STRENGTH_LABEL: Record<PasswordStrength, string> = {
  danger: "위험",
  normal: "보통",
  strong: "안전",
  "very-strong": "매우 안전",
};

export function evaluatePasswordStrength(
  password: string,
): PasswordStrength | null {
  if (!password) return null;
  if (password.length < 8) return "danger";

  const hasLetter = HAS_LETTER.test(password);
  const hasNumber = HAS_NUMBER.test(password);
  const hasSpecial = SPECIAL.test(password);

  if (hasLetter && hasNumber && hasSpecial && password.length >= 10) {
    return "very-strong";
  }
  if (hasLetter && hasNumber && hasSpecial) return "strong";
  if (hasLetter && hasNumber) return "normal";
  return "danger";
}

export function getPasswordError(password: string): string | null {
  if (!password) return null;
  if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (!SPECIAL.test(password)) return "특수문자를 1개 이상 포함해야 합니다.";
  return null;
}

// 회원가입/비밀번호 재설정 폼에서 공통으로 쓰는 비밀번호 강도 평가 composable.
// password, confirmPassword는 ref로 받아 반응형을 유지한다.
export function usePasswordStrength(
  password: Ref<string>,
  confirmPassword: Ref<string>,
) {
  const passwordStrength = computed(() => evaluatePasswordStrength(password.value));
  const passwordError = computed(() => getPasswordError(password.value));
  const confirmPasswordError = computed(() =>
    confirmPassword.value && password.value !== confirmPassword.value
      ? "비밀번호가 일치하지 않습니다."
      : null,
  );
  const isPasswordStrongEnough = computed(
    () =>
      passwordStrength.value === "strong" ||
      passwordStrength.value === "very-strong",
  );

  return {
    passwordStrength,
    passwordError,
    confirmPasswordError,
    isPasswordStrongEnough,
  };
}
