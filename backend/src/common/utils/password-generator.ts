/**
 * 안전한 랜덤 비밀번호 생성 유틸리티
 */

/**
 * 랜덤 비밀번호 생성
 *
 * @param length 비밀번호 길이 (기본값: 12)
 * @returns 생성된 비밀번호 (영문 대소문자 + 숫자 + 특수문자 조합)
 *
 * @example
 * generateSecurePassword() // "aB3$xY9!mN2@"
 * generateSecurePassword(16) // "aB3$xY9!mN2@pQ7&"
 */
export function generateSecurePassword(length: number = 12): string {
  // 비밀번호 길이는 최소 8자
  if (length < 8) {
    length = 8;
  }

  // 문자 집합 정의
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '@$!%*#?&';

  // 모든 문자 집합 합치기
  const allChars = uppercase + lowercase + numbers + specialChars;

  // 비밀번호 생성 (각 카테고리에서 최소 1개씩 포함)
  let password = '';

  // 각 카테고리에서 최소 1개씩 선택
  password += getRandomChar(uppercase);
  password += getRandomChar(lowercase);
  password += getRandomChar(numbers);
  password += getRandomChar(specialChars);

  // 나머지 길이만큼 랜덤 문자 추가
  for (let i = password.length; i < length; i++) {
    password += getRandomChar(allChars);
  }

  // 문자열 섞기 (Fisher-Yates shuffle)
  return shuffleString(password);
}

/**
 * 문자열에서 랜덤 문자 선택
 */
function getRandomChar(str: string): string {
  const randomIndex = Math.floor(Math.random() * str.length);
  return str[randomIndex];
}

/**
 * 문자열 섞기 (Fisher-Yates shuffle)
 */
function shuffleString(str: string): string {
  const arr = str.split('');

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}

/**
 * 비밀번호 강도 검증
 *
 * @param password 검증할 비밀번호
 * @returns 강도 점수 (0-4)
 * - 0: 매우 약함
 * - 1: 약함
 * - 2: 보통
 * - 3: 강함
 * - 4: 매우 강함
 */
export function checkPasswordStrength(password: string): number {
  let strength = 0;

  // 길이 체크
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // 대문자 포함 여부
  if (/[A-Z]/.test(password)) strength++;

  // 소문자 포함 여부
  if (/[a-z]/.test(password)) strength++;

  // 숫자 포함 여부
  if (/\d/.test(password)) strength++;

  // 특수문자 포함 여부
  if (/[@$!%*#?&]/.test(password)) strength++;

  // 최대 4점으로 제한
  return Math.min(strength, 4);
}
