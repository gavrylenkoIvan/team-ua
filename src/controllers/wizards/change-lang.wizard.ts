/* eslint-disable perfectionist/sort-classes */
import { Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import {
  CHANGE_LANG_WIZARD_ID,
  Keyboards,
  NEXT_WIZARD_ID,
  REGISTER_WIZARD_ID,
} from 'src/core/constants';
import { UserProfile } from 'src/core/decorators';
import { Profile } from 'src/core/entities';
import { HandlerResponse, Language, WizardContext } from 'src/types';
import { ReplyUseCases } from 'src/use-cases/reply';
import { UserUseCases } from 'src/use-cases/user';

@Wizard(CHANGE_LANG_WIZARD_ID)
export class ChangeLangWizard {
  constructor(
    private readonly replyUseCases: ReplyUseCases,
    private readonly userUseCases: UserUseCases,
  ) {}

  @WizardStep(1)
  async onEnter(
    @Ctx() ctx: WizardContext,
    @UserProfile() profile: Profile,
  ): Promise<HandlerResponse> {
    ctx.wizard.next();

    return [
      profile ? 'messages.lang.update' : 'messages.lang.select',
      { reply_markup: Keyboards.selectLang },
    ];
  }

  @On('text')
  @WizardStep(2)
  async onLang(
    @Ctx() ctx: WizardContext,
    @Message() msg: { text: string },
    @UserProfile() profile: Profile,
  ): Promise<HandlerResponse> {
    switch (msg.text) {
      case '🇺🇦':
        await this.userUseCases.update({
          id: ctx.message.from.id,
          lang: Language.UA,
        });

        break;
      case '🇬🇧':
        await this.userUseCases.update({
          id: ctx.message.from.id,
          lang: Language.EN,
        });

        break;
      default:
        return 'messages.lang.invalid';
    }

    await ctx.scene.leave();

    if (!profile) {
      await this.replyUseCases.replyI18n(ctx, 'messages.lang.changed');

      await ctx.scene.enter(REGISTER_WIZARD_ID);
      return;
    }

    await this.replyUseCases.replyI18n(ctx, 'messages.lang.changed', {
      reply_markup: Keyboards.remove,
    });
    await ctx.scene.enter(NEXT_WIZARD_ID);

    return;
  }
}
