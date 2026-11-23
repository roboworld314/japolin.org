/* =============================================================
   RECENT NEWS
   Edit this list to update the News section. Newest item first.
   The first 2 items show; the rest appear under "Show all news".

   Each item can have:
     date     text shown on the left, e.g. "Nov 2026"            (required)
     title    headline; type \n where you want a line break      (required)
     text     a sentence or two of detail                        (optional)
     image    photo path, e.g. "assets/news/2026-11-panel.jpg"   (optional)
     video    a video file such as "assets/news/demo.mp4",
              or a YouTube link                                  (optional)
     poster   still image shown before a video file plays        (optional)
     alt      short description of the photo or video            (optional)
     caption  text under the enlarged photo (defaults to title)   (optional)
     fit      "contain" for diagrams, so nothing is cropped;
              photos fill the frame by default                   (optional)
     frame    "browser" shows a website screenshot inside a
              browser-window frame                               (optional)
     frameLabel  text in that frame's address bar                (optional)
     link     { href: "https://...", label: "Read more" }        (optional)

   Put photos and videos in the assets/news/ folder. Keep each video
   file under about 25 MB, or upload it to YouTube and paste the link.
   ============================================================= */

window.NEWS = [
  {
    date: "Nov 2026",
    title: "Student panelist at the W&M Computer Science Symposium for Graduate Studies",
    text: "Joined fellow Ph.D. students on the student and alumni panel at William & Mary to talk about my research in autonomous driving.",
    image: "assets/news/2026-11-cs-symposium-panel.jpg",
    alt: "Six Ph.D. students seated on stage below a slide titled Student / Alumni Panel, W&M Computer Science Graduate Studies",
    caption: "Student and alumni panel, W&M Computer Science Symposium for Graduate Studies, November 2026"
  },
  {
    date: "Fall 2026",
    title: "Assistant instructor\nCOLL/CSCI 100: Physical Intelligence: Robots",
    text: "Helping students program 5G-connected robotic vehicles on a smart-city roadway. I built and maintain the course website.",
    image: "assets/news/2026-fall-course-website.jpg",
    frame: "browser",
    alt: "Home page of the COLL/CSCI 100 course website, with a photo of students in the Vehicle Computing Lab",
    frameLabel: "COLL/CSCI 100 course website",
    caption: "The COLL/CSCI 100: Physical Intelligence: Robots course website",
    link: { href: "https://roboworld314.github.io/VC_Lab/", label: "Visit the course website" }
  },
  {
    date: "2026",
    title: "Session chair for EdgeCAV'26 at SEC'26",
    text: "Chairing a session at the 1st International Workshop on Edge Computing for Connected and Autonomous Vehicles, and reviewing for SEC'26."
  },
  {
    date: "May 2026",
    title: "“Log What Matters” published at IEEE MOST 2026 in Detroit",
    text: "Our safety-aware adaptive logging framework for connected and autonomous vehicles. I also received a student travel grant, and our TinyLite paper appeared at the PISA workshop.",
    image: "assets/img/research/caal-pipeline.png",
    fit: "contain",
    alt: "Diagram of the CAAL-VLM adaptive logging pipeline",
    link: { href: "https://sidilu.org/paper/AdaptiveLogAsInput_MOST26.pdf", label: "Read the paper" }
  },
  {
    date: "2025",
    title: "“Context-Aware Perception” published at ACM/IEEE SEC'25",
    text: "Vision-language models for all-weather object detection in autonomous driving, presented in Arlington, VA, with a student travel grant.",
    link: { href: "https://doi.org/10.1145/3769102.3774638", label: "Read the paper" }
  }
];
