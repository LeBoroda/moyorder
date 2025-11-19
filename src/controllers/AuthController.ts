import { authModel } from "../models/AuthModel";
import { AppEvents } from "../events/events";
import { eventBus } from "../events/EventBus";

class AuthController {
  login = (email: string) => {
    const priceLevel = authModel.resolvePriceLevel(email);
    if (!priceLevel) {
      return false;
    }
    const user = { email, priceLevel };
    authModel.setUser(user);
    eventBus.emit(AppEvents.AuthLogin, user);
    return true;
  };

  logout = () => {
    authModel.clearUser();
    eventBus.emit(AppEvents.AuthLogout, null);
  };
}

export const authController = new AuthController();
