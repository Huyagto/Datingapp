import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './dto/auth.payload';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

@Mutation(() => AuthPayload)
async login(
  @Args("input") input: LoginInput,
): Promise<AuthPayload> {
  return this.authService.login(
    input.email,
    input.password
  );
}


@Mutation(() => AuthPayload)
async register(
  @Args('input') input: RegisterInput,
): Promise<AuthPayload> {
  const user = await this.authService.register(
    input.username,
    input.email,
    input.phone,
    input.password,
  );

  return this.authService.buildAuthPayload(user);
}


}
