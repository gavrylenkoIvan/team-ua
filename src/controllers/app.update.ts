import {
  Command,
  Ctx,
  Hears,
  Help,
  Message,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { REGISTER_WIZARD_ID } from 'src/core/constants';
import { Language } from 'src/core/enums/languages.enum';
import { ReplyUseCases } from 'src/use-cases/reply';
import { UserUseCases } from 'src/use-cases/user/user.use-case';

@Update()
export class AppUpdate {
  constructor(
    private readonly userUseCases: UserUseCases,
    private readonly replyUseCases: ReplyUseCases,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    // if user does not exist in session, create it
    if (!ctx.session.user) {
      ctx.session.user = await this.userUseCases.create({
        chatId: ctx.chat.id,
        userId: ctx.from.id,
      });
    }

    await this.replyUseCases.startCommandMessage(ctx);
  }

  @Hears(/🇺🇦|🇬🇧|🇷🇺/)
  async onUa(@Ctx() ctx: Context, @Message() msg: { text: string }) {
    // convert ctx.message to Message.TextMessage so we can access text property
    switch (msg.text) {
      case '🇺🇦':
        ctx.session.lang = Language.UA;
        break;
      case '🇬🇧':
        ctx.session.lang = Language.EN;
        break;
      case '🇷🇺':
        ctx.session.lang = Language.RU;
        break;
    }

    await this.replyUseCases.languageChanged(ctx);

    if (!ctx.session.user || !ctx.session.user.profile) {
      // if profile does not exist, create it
      await this.replyUseCases.newUser(ctx);

      await ctx.scene.enter(REGISTER_WIZARD_ID);
    }
  }

  @Command('language')
  async onLanguage(@Ctx() ctx: Context) {
    await this.replyUseCases.updateLanguage(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await this.replyUseCases.helpCommandMessage(ctx);
  }
}
