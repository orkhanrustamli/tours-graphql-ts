import { getMe } from "./handlers/AuthHandlers";
import { getAllTours, getTour } from "./handlers/TourHandlers";

const Query = {
  // AUTH
  getMe,
  // TOURS
  getAllTours,
  getTour,
};

export default Query;
