# Friends Messenger MVP (Stage 2)

Практичный мини-мессенджер для "своих" (15-20 человек) на Node.js + Express + SQLite + WebSocket + vanilla frontend.

Этап 1 (direct messages) сохранен.
Этап 2 добавляет групповые чаты, replies, reactions, базовый UX-порядок (unread/pin/mute/archive) и поиск.

## Stack

- Backend: Node.js + Express
- DB: SQLite
- Realtime: WebSocket (`ws`)
- Frontend: Vanilla HTML/CSS/JS

## Что реализовано на этапе 2

1. Group chats
- создание группового чата;
- поля чата: `id`, `title`, `avatar`, `created_by`, `created_at`;
- участники группы и роли: `owner`, `admin`, `member`;
- добавление/удаление участников;
- выход из группы;
- список групп в общей колонке с direct чатами;
- история и отправка сообщений в группе;
- realtime обновления групповых сообщений.

2. Права в группе
- `owner/admin`: rename группы, add/remove участников, удаление сообщений участников;
- `member`: писать сообщения, редактировать/удалять свои, выходить из группы.

3. Replies
- `reply_to_message_id` в сообщениях;
- ответы на конкретное сообщение;
- preview сообщения-родителя в UI;
- работает для direct и group.

4. Reactions
- фиксированный набор emoji;
- toggle поставить/убрать свою реакцию;
- агрегированные реакции у сообщения;
- realtime обновления реакций.

5. UX-порядок
- unread counters;
- pin chat;
- mute chat;
- archive chat;
- хранение настроек на уровне `conversation_members`.

6. Search
- поиск по тексту в текущем чате;
- глобальный поиск по доступным сообщениям пользователя;
- результаты с контекстом и переходом к сообщению.

## Архитектура

- `server.js` - entrypoint
- `src/server.js` - bootstrap
- `src/createApp.js` - HTTP API
- `src/messengerService.js` - бизнес-логика
- `src/realtimeHub.js` - WebSocket/presence/realtime
- `src/db/*` - SQLite клиент и миграции
- `public/*` - UI
- `scripts/seed.js` - сиды
- `scripts/smoke-stage2.js` - автосмоук stage 2
- `scripts/full-test.js` - полный API+WebSocket интеграционный тест
- `scripts/ui-smoke.js` - UI smoke (headless Edge через playwright-core)

## Миграции

- `src/db/migrations/001_mvp_core.sql` - базовое MVP-ядро
- `src/db/migrations/002_groups_replies_reactions.sql` - `message_reactions`, `moderation_logs`

Плюс в `src/db/migrate.js` есть backward-compatible `ensureColumn(...)` для мягкого апгрейда уже существующих БД (колонки для avatar/reply/metadata/preferences).

## Быстрый запуск

1. Скопировать env:

```powershell
Copy-Item .env.example .env
```

2. Указать `INVITE_KEY` в `.env`.

3. Установить зависимости:

```powershell
npm.cmd install
```

4. Сиды (опционально, но удобно):

```powershell
npm.cmd run seed
```

5. Запуск:

```powershell
npm.cmd start
```

6. Открыть:

[http://localhost:3000](http://localhost:3000)

## Demo users из seed

- `demo_alex / demo1234`
- `demo_sam / demo1234`
- `demo_kate / demo1234`
- `demo_ivan / demo1234`

Группа: `Project Crew` (owner: `demo_alex`, admin: `demo_sam`).

## API (основные endpoint'ы)

Auth/Profile:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/profile/me`
- `PATCH /api/profile/me`

Users/Chats:
- `GET /api/users/search?q=<username>`
- `GET /api/chats?archived=<true|false>`
- `POST /api/chats/direct`
- `POST /api/chats/group`
- `PATCH /api/chats/:chatId/group`
- `GET /api/chats/:chatId/group/members`
- `POST /api/chats/:chatId/group/members`
- `PATCH /api/chats/:chatId/group/members/:userId/role`
- `DELETE /api/chats/:chatId/group/members/:userId`
- `POST /api/chats/:chatId/group/leave`
- `PATCH /api/chats/:chatId/preferences`

Messages:
- `GET /api/chats/:chatId/messages`
- `POST /api/chats/:chatId/messages`
- `POST /api/chats/:chatId/read`
- `PATCH /api/messages/:messageId`
- `DELETE /api/messages/:messageId`
- `POST /api/messages/:messageId/reactions`

Search:
- `GET /api/chats/:chatId/search?q=<text>&limit=<n>`
- `GET /api/messages/search?q=<text>&limit=<n>`

Service:
- `GET /health`

## Как протестировать новые функции

### 1) Полный backend/regression тест

```powershell
node scripts/full-test.js
```

Скрипт поднимает сервер на отдельной БД и проверяет end-to-end API+realtime:
- health/root page;
- auth/profile/users;
- direct/group chats;
- messages edit/delete/replies/reactions/statuses;
- roles/moderation/member management;
- pin/mute/archive;
- chat/global search;
- негативные сценарии прав и валидаций.

### 2) Stage-2 smoke

```powershell
npm.cmd run smoke:stage2
```

Покрывает ключевые сценарии stage 2 на отдельной БД.

### 3) UI smoke (headless)

```powershell
npm.cmd run smoke:ui
```

Проверяет пользовательские UI-флоу:
- register/login/logout;
- direct chat + send/reply/edit/delete/reactions;
- group chat + create/rename/members;
- replies;
- realtime доставка между двумя клиентами;
- pin/mute/archive;
- chat/global search;
- отсутствие client-state ошибки `Failed to fetch`.

### 4) Ручная проверка UI

- открыть direct чат через поиск по username;
- создать group через `Create Group`;
- открыть `Members`/`Manage` для ролей и удаления;
- отправить reply, поставить reaction;
- pin/mute/archive текущий чат;
- проверить поиск в чате и глобальный поиск;
- проверить состояния loading/empty/error.

## Что делать следующим этапом

1. Attachments (файлы/изображения) с минимальным storage-слоем.
2. Улучшенный поиск (индексация/FTS, фильтры, jump-to-message с пагинацией).
3. Mentions (`@username`) и уведомления о mention.
4. Pinned messages в чате.
5. Moderation log UI (история действий owner/admin).
