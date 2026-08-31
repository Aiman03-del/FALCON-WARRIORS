/**
 * যেকোনো error থেকে exact/raw মেসেজ ইউজারকে দেখানো হয় না।
 * আসল error শুধু console-এ লগ হয় (debugging-এর জন্য), ইউজার শুধু একটা পরিষ্কার generic মেসেজ দেখে।
 */
export function getFriendlyErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  // ডেভেলপারদের জন্য আসল error console-এ থেকে যাবে
  console.error("[App Error]:", error);
  return fallback;
}