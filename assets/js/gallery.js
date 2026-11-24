/* =============================================================
   MOMENTS: the photo corner
   -------------------------------------------------------------
   To add a photo:
   1. Put the image in the assets/moments/ folder.
   2. Copy one block below, paste it at the TOP of the list,
      and change the details.

   tag   One of: "Award", "Talk", "Teaching", "Lab", "Event".
         The filter buttons are made from the tags you use.
   size  "big" spans two columns and two rows (a featured photo),
         "wide" spans two columns. Leave it out for a normal tile.
   fit   "contain" shows the whole image without cropping.
   ============================================================= */

window.MOMENTS = [
  {
    src: "assets/news/2026-11-cs-symposium-panel.jpg",
    title: "Student/Alumni Panel, W&M CS Symposium",
    date: "Nov 2026",
    tag: "Talk",
    size: "big",
    alt: "Six Ph.D. students seated on stage below a slide titled Student / Alumni Panel, W&M Computer Science Graduate Studies"
  },
  {
    src: "assets/news/2026-fall-coll100-class.jpg",
    title: "Teaching COLL/CSCI 100: Physical Intelligence: Robots",
    date: "Fall 2026",
    tag: "Teaching",
    size: "wide",
    fit: "contain",
    background: "#f4f3ee",
    alt: "COLL/CSCI 100 students in the Vehicle Computing Lab on the smart-city roadway"
  },
  {
    src: "assets/moments/2026-07-robot-vehicle.jpg",
    title: "Our robotic vehicle: camera, LiDAR, and 5G",
    date: "Jul 2026",
    tag: "Lab",
    alt: "A small four-wheeled robotic vehicle with a camera, LiDAR, and onboard computer, next to a 5G antenna"
  },
  {
    src: "assets/moments/2026-06-vc-lab-smart-city-testbed.jpg",
    title: "Smart-city testbed in the Vehicle Computing Lab",
    date: "Jun 2026",
    tag: "Lab",
    alt: "Miniature smart-city roadway with lanes, crosswalks, and parking spots, with robotic vehicles driving on it"
  }
];
