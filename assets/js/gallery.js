/* =============================================================
   MOMENTS: the photo corner
   -------------------------------------------------------------
   To add a photo:
   1. Put the image in the assets/moments/ folder.
   2. Copy one block below, paste it at the TOP of the list,
      and change the details.

   tag   One of: "Award", "Talk", "Teaching", "Lab", "Event".
   size  "big" spans two columns and two rows (a featured photo),
         "wide" spans two columns, "tall" spans two rows (good for
         portrait photos). Leave it out for a normal tile.
   position  Which part of the photo to keep in view, e.g. "center 30%".
   fit   "contain" shows the whole image without cropping.
   ============================================================= */

window.MOMENTS = [
  {
    src: "assets/moments/2025-12-sec25-travel-grant.jpg",
    title: "Student Travel Grant, ACM/IEEE SEC 2025",
    date: "Dec 2025",
    tag: "Award",
    size: "tall",
    position: "center 32%",
    alt: "Johora Akter Polin holding her Student Travel Grant certificate on stage at ACM/IEEE SEC 2025, in front of the conference banner"
  },
  {
    src: "assets/moments/2025-12-sec25-talk.jpg",
    title: "Presenting Context-Aware Perception at ACM/IEEE SEC'25",
    date: "Dec 2025",
    tag: "Talk",
    size: "big",
    alt: "Johora Akter Polin presenting a slide titled VLM-Guided Adaptive Weather-Aware Perception Pipeline to an audience"
  },
  {
    src: "assets/moments/2025-capwic.jpg",
    title: "ACM CAPWIC, Celebration of Women in Computing",
    date: "2025",
    tag: "Event",
    size: "tall",
    position: "center 40%",
    alt: "Johora Akter Polin and two fellow attendees holding a CAPWIC sign in front of a wall of green leaves"
  },
  {
    src: "assets/news/2026-11-cs-symposium-panel.jpg",
    title: "Student/Alumni Panel, W&M CS Symposium",
    date: "Nov 2026",
    tag: "Talk",
    size: "big",
    alt: "Six Ph.D. students seated on stage below a slide titled Student / Alumni Panel, W&M Computer Science Graduate Studies"
  },
  {
    src: "assets/moments/2026-05-most26-discussion.jpg",
    title: "Joining the discussion at IEEE MOST 2026, Detroit",
    date: "May 2026",
    tag: "Event",
    size: "big",
    position: "center 35%",
    alt: "Johora Akter Polin speaking into a microphone at a round table during IEEE MOST 2026"
  }
];
