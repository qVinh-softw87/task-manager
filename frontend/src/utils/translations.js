export const translations = {
  vi: {
    // General
    logo: "TaskManager",
    
    // Login
    loginTitle: "TaskManager",
    loginSubtitle: "Đăng nhập vào tài khoản của bạn",
    emailLabel: "Email",
    passwordLabel: "Mật khẩu",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Mật khẩu",
    loginButton: "Tiếp tục bằng Email",
    loggingIn: "Đang đăng nhập...",
    noAccount: "Chưa có tài khoản?",
    registerLink: "Đăng ký miễn phí",
    loginErrorEmail: "Vui lòng nhập địa chỉ email hợp lệ.",
    loginErrorDefault: "Email hoặc mật khẩu không chính xác.",
    
    // Register
    registerTitle: "TaskManager",
    registerSubtitle: "Tạo tài khoản mới",
    nameLabel: "Họ và tên",
    namePlaceholder: "Tên của bạn",
    registerButton: "Đăng ký",
    creatingAccount: "Đang tạo tài khoản...",
    haveAccount: "Đã có tài khoản?",
    loginLink: "Đăng nhập",
    registerErrorName: "Tên phải có ít nhất 2 ký tự.",
    registerErrorEmail: "Vui lòng nhập địa chỉ email hợp lệ.",
    registerErrorPasswordLength: "Mật khẩu phải có ít nhất 6 ký tự.",
    registerErrorPasswordPattern: "Mật khẩu phải chứa ít nhất một chữ cái và một chữ số.",
    registerErrorDefault: "Đăng ký thất bại. Vui lòng thử lại.",
    
    // Dashboard
    tasksTitle: "Công việc",
    loggedInAs: "Đăng nhập với",
    writeTaskPlaceholder: "Nhập tiêu đề công việc mới...",
    addDescriptionPlaceholder: "Thêm mô tả...",
    priorityLabel: "Độ ưu tiên",
    dueDateLabel: "Hạn chót",
    cancel: "Hủy",
    addTask: "Thêm công việc",
    save: "Lưu",
    
    // Stats
    totalTasks: "Tổng số công việc",
    inProgress: "Đang thực hiện",
    completed: "Đã hoàn thành",
    completionRate: "Tỷ lệ hoàn thành",
    
    // Tasks list
    pendingCol: "CHỜ XỬ LÝ",
    inProgressCol: "ĐANG THỰC HIỆN",
    completedCol: "ĐÃ HOÀN THÀNH",
    noTasks: "Không có công việc nào trong phần này",
    timeSpent: "Thời gian đã chạy: ",
    activeBadge: "Đang hoạt động",
    
    // Sidebar
    allTasks: "Tất cả công việc",
    overview: "Tổng quan",
    analytics: "Phân tích",
    logout: "Đăng xuất",
    
    // Priorities
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",

    // Toast notifications
    toastAddSuccess: "Đã thêm công việc thành công!",
    toastAddError: "Không thể thêm công việc. Thử lại.",
    toastEditSuccess: "Đã lưu thay đổi.",
    toastEditError: "Không thể lưu thay đổi. Thử lại.",
    toastDeleteSuccess: "Đã xóa công việc.",
    toastDeleteError: "Không thể xóa. Thử lại.",
    toastStatusError: "Không thể đổi trạng thái. Thử lại.",
    toastStatusChanged: "Đã cập nhật trạng thái.",
    toastLoadError: "Không thể tải danh sách công việc.",

    // Confirm delete dialog
    confirmDeleteTitle: "Xóa công việc?",
    confirmDeleteMsg: "Hành động này không thể hoàn tác.",
    confirmDelete: "Xóa",
    cancelDelete: "Hủy",

    // Empty state
    emptyPending: "Không có công việc đang chờ",
    emptyPendingHint: "Nhập tiêu đề phía trên để bắt đầu",
    emptyInProgress: "Không có việc nào đang thực hiện",
    emptyInProgressHint: "Chuyển trạng thái task sang Đang thực hiện",
    emptyCompleted: "Chưa có việc nào hoàn thành",
    emptyCompletedHint: "Hoàn thành các task để chúng xuất hiện ở đây",
  },
  en: {
    // General
    logo: "TaskManager",
    
    // Login
    loginTitle: "TaskManager",
    loginSubtitle: "Sign in to your account",
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Password",
    loginButton: "Continue with email",
    loggingIn: "Logging in...",
    noAccount: "No account?",
    registerLink: "Register for free",
    loginErrorEmail: "Please enter a valid email address.",
    loginErrorDefault: "Email or password is incorrect.",
    
    // Register
    registerTitle: "TaskManager",
    registerSubtitle: "Create your account",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    registerButton: "Create account",
    creatingAccount: "Creating account...",
    haveAccount: "Already have an account?",
    loginLink: "Login",
    registerErrorName: "Name must be at least 2 characters.",
    registerErrorEmail: "Please enter a valid email address.",
    registerErrorPasswordLength: "Password must be at least 6 characters.",
    registerErrorPasswordPattern: "Password must contain at least one letter and one number.",
    registerErrorDefault: "Registration failed. Please try again.",
    
    // Dashboard
    tasksTitle: "Tasks",
    loggedInAs: "Logged in as",
    writeTaskPlaceholder: "Write a new task title...",
    addDescriptionPlaceholder: "Add description...",
    priorityLabel: "Priority",
    dueDateLabel: "Due Date",
    cancel: "Cancel",
    addTask: "Add Task",
    save: "Save",
    
    // Stats
    totalTasks: "Total Tasks",
    inProgress: "In Progress",
    completed: "Completed",
    completionRate: "Completion Rate",
    
    // Tasks list
    pendingCol: "PENDING",
    inProgressCol: "IN PROGRESS",
    completedCol: "COMPLETED",
    noTasks: "No tasks in this section",
    timeSpent: "Time spent: ",
    activeBadge: "Active",
    
    // Sidebar
    allTasks: "All Tasks",
    overview: "Overview",
    analytics: "Analytics",
    logout: "Log out",
    
    // Priorities
    low: "Low",
    medium: "Medium",
    high: "High",

    // Toast notifications
    toastAddSuccess: "Task added successfully!",
    toastAddError: "Could not add task. Please try again.",
    toastEditSuccess: "Changes saved.",
    toastEditError: "Could not save changes. Please try again.",
    toastDeleteSuccess: "Task deleted.",
    toastDeleteError: "Could not delete task. Please try again.",
    toastStatusError: "Could not update status. Please try again.",
    toastStatusChanged: "Status updated.",
    toastLoadError: "Could not load tasks.",

    // Confirm delete dialog
    confirmDeleteTitle: "Delete task?",
    confirmDeleteMsg: "This action cannot be undone.",
    confirmDelete: "Delete",
    cancelDelete: "Cancel",

    // Empty state
    emptyPending: "No pending tasks",
    emptyPendingHint: "Type a title above to get started",
    emptyInProgress: "Nothing in progress",
    emptyInProgressHint: "Move a task here to start working",
    emptyCompleted: "No completed tasks yet",
    emptyCompletedHint: "Finish tasks to see them here",
  }
};
