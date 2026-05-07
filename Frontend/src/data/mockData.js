export const mockUsers = [
  {
    id: 1,
    name: "Nguyen Van An",
    email: "an.student@engpro.vn",
    password: "123456",
    role: "student",
  },
  {
    id: 2,
    name: "Tran Thi Bich",
    email: "bich.student@engpro.vn",
    password: "123456",
    role: "student",
  },
  {
    id: 3,
    name: "Le Hoang Minh",
    email: "minh.student@engpro.vn",
    password: "123456",
    role: "student",
  },
];

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getNextMockUserId() {
  return mockUsers.reduce((maxId, user) => Math.max(maxId, user.id), 0) + 1;
}

export function findMockUserByCredentials(email, password) {
  const normalizedEmail = normalizeEmail(email);

  return (
    mockUsers.find(
      (user) => normalizeEmail(user.email) === normalizedEmail && user.password === password,
    ) ?? null
  );
}

export function isMockEmailTaken(email) {
  const normalizedEmail = normalizeEmail(email);

  return mockUsers.some((user) => normalizeEmail(user.email) === normalizedEmail);
}

export function addMockUser({ name, email, password }) {
  const newUser = {
    id: getNextMockUserId(),
    name: String(name ?? "").trim(),
    email: normalizeEmail(email),
    password,
    role: "student",
  };

  mockUsers.push(newUser);

  return newUser;
}
