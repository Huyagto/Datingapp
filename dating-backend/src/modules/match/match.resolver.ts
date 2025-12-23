import { Resolver, Query } from '@nestjs/graphql';
import { Match } from './match.type';
import { MatchService } from './match.service';

import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Resolver(() => Match)
@UseGuards(GqlAuthGuard)
export class MatchResolver {
  constructor(private readonly matchService: MatchService) {}

  @Query(() => [Match])
  myMatches(
    @CurrentUser() user: { id: string },
  ): Promise<Match[]> {
    return this.matchService.findMyMatches(user.id);
  }
}
