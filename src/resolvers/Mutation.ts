import { signup, login, forgotPassword, resetPassword, changePassword, deleteUser, updateMe } from "./handlers/AuthHandlers";
import { createTour } from "./handlers/TourHandlers";
import { createReview } from "./handlers/ReviewHandlers";

const Mutation = {
  // Auth Mutations
  signup,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteUser,
  updateMe,
  // Tour Mutations
  createTour,
  // Review Mutations
  createReview,
};

export default Mutation;
