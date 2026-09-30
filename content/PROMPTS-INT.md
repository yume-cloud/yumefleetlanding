# Промпты для картинок страниц интеграций

Семь картинок в первый экран разделов `/integrations/*/`. Стиль взят с уже существующих
`assets/img/gen/F5.webp` (штраф) и `F6.webp` (переход с Cloud): 3D-объекты на белом фоне,
жёлтый акцент бренда, мягкие тени.

**Размер:** 1500 × 750 (2:1), как у остальных картинок в `assets/img/gen/`.
**Формат:** WebP.
**Имена файлов:** `assets/img/gen/INT-egov.webp`, `INT-erap.webp`, `INT-debtors.webp`,
`INT-blacklist.webp`, `INT-wazzup.webp`, `INT-wialon.webp`, `INT-ai.webp`.

**Картинки по этим промптам уже сгенерированы и стоят на страницах** — файлы лежат
в `assets/img/gen/`. Промпты оставлены здесь, чтобы можно было перегенерировать любую
картинку, не собирая описание заново.

**Фон обязательно чисто белый, а объект должен заполнять кадр.** Первая версия была
сделана на светло-сером фоне и с мелким объектом посередине — на странице это читалось
как серая коробка, непохожая на остальные картинки сайта. Блок стиля ниже уже исправлен.

**Текста на картинках быть не должно.** Сайт двуязычный, а надпись внутри картинки не
переводится и не правится. Все подписи даёт вёрстка.

---

## Общий блок стиля

Дописывайте его к каждому промпту — он держит все семь картинок в одном стиле.

```
3D product illustration, soft studio lighting, matte and translucent glossy materials,
objects on a pure white seamless background #FFFFFF, only a soft subtle contact shadow
directly beneath the objects, no vignette, no grey gradient, three-quarter view,
amber yellow #F0B100 as the main accent, soft violet #6C5CE7 as secondary, white and
light grey neutrals, red only for alerts, clean and friendly.
The subject is LARGE and fills most of the frame, tightly framed with only a small even
margin, centred, wide 2:1 landscape composition.
Absolutely no text, no letters, no handwriting, no numbers, no logos, no brand marks,
no watermark.
```

## Негативный промпт

```
text, letters, words, numbers, handwriting, signature scribble, captions, UI labels,
logos, brand marks, watermark, grey background, vignette, dark background, harsh shadows,
heavy gradients, small subject lost in empty space, cluttered composition,
photorealistic human faces, stock-photo look, neon, cyberpunk
```

---

## 1. eGov mobile — `/integrations/egov/`

```
A smartphone standing upright with a blank dark screen, a rounded white document sheet
floating beside it, a glowing amber wax-style checkmark seal pressing onto the sheet,
a thin amber signature stroke curving from the phone to the document, a small translucent
violet shield floating behind.
```

## 2. Штрафы ПДД и ЕРАП — `/integrations/erap/`

```
A rounded car licence plate tile on the left, a wide curved amber arrow carrying two small
violation notice sheets to the right, a rounded driver profile card catching them, a small
grey traffic camera on a pole standing far in the soft-focus background.
```

Композиция должна отличаться от `F5.webp`, которая уже стоит на `/features/fines/`:
там крупная камера, протокол и часы на переднем плане. Здесь камера — мелкая деталь
на заднем плане, часов нет.

## 3. Реестр должников — `/integrations/debtors/`

```
A rounded blank ID card floating in the centre, a large translucent glass magnifier passing
over it, an amber shield with a checkmark below the card, a soft violet document folder
standing behind.
```

## 4. Чёрный список парков — `/integrations/blacklist/`

```
Three small rounded building tiles arranged in a shallow arc, thin amber lines connecting
them to one shared dark charcoal list panel in the centre, a single driver avatar chip on
the panel marked with a small red warning dot.
```

## 5. WhatsApp через Wazzup — `/integrations/wazzup/`

```
Three rounded chat bubbles falling into a wide translucent violet funnel, a car key on a
ring dropping out of the funnel bottom, the bubbles in amber and white, soft glow inside
the funnel.
```

## 6. GPS Wialon — `/integrations/wialon/`

```
A small white sedan seen from three-quarters above, a tall amber map pin hovering over its
roof, a dotted amber route curving behind the car across a soft rounded map plate, a round
odometer dial floating to the side.
```

## 7. ИИ-ассистент — `/integrations/ai/`

```
A large rounded chat bubble in the centre, a four-point amber sparkle rising out of it,
two small translucent chart cards orbiting around it — one with bars, one with a line,
a soft violet glow behind the sparkle.
```

---

## Если фон всё равно вышел сероватым

Модель нет-нет да и добавит лёгкое затемнение по краям. Это лечится выравниванием фона:
по рамке кадра берётся только фон, по нему строится квадратичная поверхность освещения,
и картинка на неё делится. Объект при этом не трогается. Скрипт занимает десяток строк
на Pillow и numpy — три картинки из семи пришлось так поправить.

## Если картинки не сойдутся между собой

Генерируйте подряд в одной сессии и после первой удачной пишите «тот же стиль,
тот же фон и свет, теперь …». Так модель держит серию ровнее, чем когда каждый
промпт отправляют отдельно.
