import { Request } from 'express';
import { User } from 'src/modules/auth/database/user.entity';

export interface AuthenticatedRequest extends Request {
  user?: User;
}
