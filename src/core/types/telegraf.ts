import {
  ForceReply,
  InlineKeyboardMarkup,
  MessageEntity,
  ParseMode,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'telegraf/typings/core/types/typegram';

type Extra = Omit<
  {
    chat_id: string | number;
    message_thread_id?: number;
    text: string;
    parse_mode?: ParseMode;
    entities?: MessageEntity[];
    disable_web_page_preview?: boolean;
    disable_notification?: boolean;
    protect_content?: boolean;
    reply_to_message_id?: number;
    allow_sending_without_reply?: boolean;
    reply_markup?:
      | InlineKeyboardMarkup
      | ReplyKeyboardMarkup
      | ReplyKeyboardRemove
      | ForceReply;
  },
  'chat_id' | 'text'
>;

export type { Extra };