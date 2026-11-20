# Survival guide packs

Out & Back has a set of built-in guides (life-saving first aid and emergencies, in `index.html`) and downloadable packs (this folder). Packs stay on the phone after downloading and update themselves when their `v` goes up.

## Rules that keep it organised

1. **Shelves.** Every guide sits on exactly one shelf: First aid, Emergencies & disasters, Useful to know, Outdoors & nature, Home & no power, Food, Skills, On the road & travel, Just for fun. A pack has a `shelf`; a guide can override it.
2. **One home per topic.** A topic is written once. Elsewhere, link to it with `see: ["guide-id"]` instead of copying it.
3. **Built in vs. pack.** Anything that saves a life in the first minutes is built in (works even if no pack was ever downloaded). Everything else goes in a pack.
4. **Pack size.** 6–12 guides per pack; split a pack that grows bigger.
5. **Changing a pack.** Edit, raise its `v` by one, rebuild. Phones pick it up within 12 hours when online.
6. **Pictures.** Steps can have a picture (`a`), drawn with the app's own style. New pictures for a pack ship inside the pack (`art`), so new packs need no app update.

## Building

`tools/packs/build_packs.py` builds every pack and `index.json` (the catalog with all guide titles, so search also finds guides that aren't downloaded), renders the pictures and refuses to publish when it finds:
- the same guide id twice,
- two guides with nearly the same title (unless marked as different topics),
- a "see also" link to a guide that doesn't exist,
- a picture that doesn't exist, or more pictures than steps.
