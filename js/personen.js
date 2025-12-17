// CSV-URL
const csvUrl = "https://docs.google.com/spreadsheets/d/1FhA-X8jAoMpTy75NShE4ynjL4sKPld-i8Cn2AQiZDIk/gviz/tq?tqx=out:csv&sheet=HWN";

document.addEventListener("DOMContentLoaded", () => {
  const currentFile = window.location.pathname.split("/").pop();
  const aktuellerName = currentFile.replace(".html", "");

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const cleanedText = csvText.replace(/"/g, "");
      const rows = cleanedText.trim().split("\n");

      const headers = rows[0].split(",").map(h => h.trim());
      const nameIndex = headers.indexOf(aktuellerName);
      const stempelIndex = headers.indexOf("Stempel");

      if (nameIndex === -1) {
        throw new Error(`Spalte '${aktuellerName}' nicht gefunden`);
      }

      const values = rows.slice(1).map(r => r.split(",")[nameIndex].trim());
      const stempelSpalte = rows.slice(1).map(r => r.split(",")[stempelIndex].trim());

      /* ===============================
         SUMME
      =============================== */
      const summe = values
        .slice(0, -1)
        .reduce((acc, v) => acc + (v === "" ? 0 : Number(v)), 0);

      document.getElementById("summe").textContent = summe;

      /* ===============================
         LÄNGSTE STREAK
      =============================== */
      let maxStreak = 0, streak = 0;
      let sStart = -1, sEnd = -1, tempStart = 0;

      values.forEach((v, i) => {
        if (Number(v) === 1) {
          if (streak === 0) tempStart = i;
          streak++;
          if (streak > maxStreak) {
            maxStreak = streak;
            sStart = tempStart;
            sEnd = i;
          }
        } else {
          streak = 0;
        }
      });

      document.getElementById("streak").textContent = maxStreak;
      document.getElementById("streak_start").textContent =
        sStart !== -1 ? stempelSpalte[sStart] : "-";
      document.getElementById("streak_end").textContent =
        sEnd !== -1 ? stempelSpalte[sEnd] : "-";

      /* ===============================
         LÄNGSTE NEGATIVE STREAK
      =============================== */
      let maxNeg = 0, neg = 0;
      let nStart = -1, nEnd = -1, tempNegStart = 0;

      values.forEach((v, i) => {
        if (v === "") {
          if (neg === 0) tempNegStart = i;
          neg++;
          if (neg > maxNeg) {
            maxNeg = neg;
            nStart = tempNegStart;
            nEnd = i;
          }
        } else {
          neg = 0;
        }
      });

      document.getElementById("neg_streak").textContent = maxNeg;
      document.getElementById("neg_streak_start").textContent =
        nStart !== -1 ? stempelSpalte[nStart] : "-";
      document.getElementById("neg_streak_end").textContent =
        nEnd !== -1 ? stempelSpalte[nEnd] : "-";
    })
    .catch(err => {
      console.error(err);
    });
});

 // Sicherstellen, dass DOM bereit ist
document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('click', function (event) {

        // Klicks in stampfree-Bereichen ignorieren
        if (event.target.closest('.stampfree')) {
            return;
        }

        const x = event.pageX;
        const y = event.pageY;

        const rotation = Math.max(
            -180,
            Math.min(180, randomNormal(0, 40))
        );

        const img = document.createElement('img');
        img.src = 'images/Nudelstempel.svg';
        img.className = 'stempel';

        img.style.left = x + 'px';
        img.style.top  = y + 'px';
        img.style.transform =
            `translate(-50%, -50%) rotate(${rotation}deg)`;

        document.body.appendChild(img);
    });

        function randomNormal(mean = 0, stdDev = 40) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();

        return mean + stdDev *
            Math.sqrt(-2.0 * Math.log(u)) *
            Math.cos(2.0 * Math.PI * v);
    }

});