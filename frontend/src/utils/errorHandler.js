export function getErrorMessage(err, t, defaultMsg = null) {
  // If it's a network error (no response)
  if (!err.response) {
    return t.networkError || "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.";
  }

  const status = err.response.status;
  const backendMessage = err.response.data?.message;
  const isLoginRoute = err.config?.url?.includes('/login');

  // Map known backend english messages to translated strings if possible
  let localizedBackendMessage = backendMessage;
  if (backendMessage === "Email already exist") {
    localizedBackendMessage = t.emailExists || "Email này đã được sử dụng.";
  } else if (backendMessage === "Invalid email or password") {
    localizedBackendMessage = t.loginErrorDefault || "Email hoặc mật khẩu không chính xác.";
  }

  switch (status) {
    case 401:
      if (isLoginRoute) {
        return localizedBackendMessage || defaultMsg;
      }
      return t.authExpired;
    case 400:
      return localizedBackendMessage || defaultMsg || "Dữ liệu không hợp lệ.";
    case 403:
      return t.forbidden || "Bạn không có quyền thực hiện thao tác này.";
    case 404:
      return t.notFound || "Không tìm thấy dữ liệu.";
    case 429:
      return t.tooManyRequests || "Thao tác quá nhiều lần. Vui lòng thử lại sau.";
    case 500:
    case 502:
    case 503:
    case 504:
      return t.serverError || "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.";
    default:
      return localizedBackendMessage || defaultMsg || t.defaultError || "Đã xảy ra lỗi không xác định.";
  }
}
