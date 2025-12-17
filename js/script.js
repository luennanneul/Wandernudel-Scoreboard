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



    // Daten je Metrik hinterlegen
/* const daten = {
    stempelzahl: {
        max: 222,
        werte: {
            Lena: 184,
            Thorben: 191,
            Jessie: 95,
            Jan: 185
        }
    },
    streak: {
        max: 222,
        werte: {
            Lena: 12,
            Thorben: 18,
            Jessie: 5,
            Jan: 9
        }
    },
    neg_streak: {
        max: 222,
        werte: {
            Lena: 3,
            Thorben: 7,
            Jessie: 2,
            Jan: 4
        }
    }
}; */

document.getElementById("submitBtn").addEventListener("click", function () {
    const auswahl = document.getElementById("metrik").value;
    const { werte, max } = daten[auswahl];

    // Alle Zeilen des Tabellenkörpers durchgehen
    document.querySelectorAll("#score tbody tr").forEach(tr => {
        const person = tr.querySelector("th").textContent.trim();
        const wert = werte[person];

        const td = tr.querySelector("td");

        // Balkengröße anpassen
        td.style.setProperty("--size", `calc(${wert}/${max})`);

        // Zahl anpassen
        tr.querySelector(".data").textContent = wert;
        
        console.log("Button geklickt.")
    });
});



document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#score tbody tr').forEach(tr => {
        tr.addEventListener('click', function() {
            const img = tr.querySelector('.person');
            if (img && img.dataset.id) {
                window.location.href = img.dataset.id + '.html';
            }
        });

        // keyboard accessibility for the person image
        const img = tr.querySelector('.person');
        if (img) {
            img.setAttribute('tabindex', '0');
            img.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.code === 'Space' || e.key === ' ') {
                    e.preventDefault();
                    if (img.dataset.id) window.location.href = img.dataset.id + '.html';
                }
            });
        }
    });
});

    const url = "https://docs.google.com/spreadsheets/d/1FhA-X8jAoMpTy75NShE4ynjL4sKPld-i8Cn2AQiZDIk/gviz/tq?tqx=out:csv&sheet=HWN";
const personen = ["Lena", "Thorben", "Jessie", "Jan"];

let daten = {
  stempelzahl: { max: 0, werte: {} },
  streak: { max: 0, werte: {} },
  neg_streak: { max: 0, werte: {} }
};

let streakTabelle = {};

async function ladeUndVerarbeiteCSV() {
  const response = await fetch(url);
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, { header: true });
  const rows = parsed.data;

  function findeLaengsteFolge(array, checkFn) {
    let maxLen = 0, currentLen = 0;
    let startIndex = -1, endIndex = -1;
    let tempStart = 0;
    array.forEach((val,i)=>{
      if(checkFn(val)){
        if(currentLen===0) tempStart=i;
        currentLen++;
        if(currentLen>maxLen){
          maxLen=maxLen; // bleibt für Berechnung der Länge
          startIndex=tempStart;
          endIndex=i;
          maxLen=currentLen;
        }
      } else currentLen=0;
    });
    return {startIndex,endIndex,length: maxLen};
  }

  personen.forEach(name=>{
    const spalte = rows.map(r=>r[name]);
    const stempelSpalte = rows.map(r=>r["Stempel"]);

    // Summe aller Einträge bis auf den letzten
    const summe = spalte.slice(0,-1).reduce((acc,val)=>acc+(val===""?0:Number(val)),0);
    daten.stempelzahl.werte[name]=summe;

    // Längste Streak
    const {startIndex: sStart,endIndex: sEnd,length: sLength} = findeLaengsteFolge(spalte,val=>Number(val)===1);
    daten.streak.werte[name]=sLength;

    // Längste Neg-Streak (leere Zellen)
    const {startIndex: nStart,endIndex: nEnd,length: nLength} = findeLaengsteFolge(spalte,val=>val===""||val===null||val===undefined);
    daten.neg_streak.werte[name]=nLength;

    // Speichern in Streak-Tabelle
    streakTabelle[name]={
      streak: {
        startIndex: sStart,
        endIndex: sEnd,
        startStempel: sStart!==-1?stempelSpalte[sStart]:null,
        endStempel: sEnd!==-1?stempelSpalte[sEnd]:null,
        length: sLength
      },
      neg_streak: {
        startIndex: nStart,
        endIndex: nEnd,
        startStempel: nStart!==-1?stempelSpalte[nStart]:null,
        endStempel: nEnd!==-1?stempelSpalte[nEnd]:null,
        length: nLength
      }
    };
  });

  // Max/Min Werte
  daten.stempelzahl.max=Math.max(...Object.values(daten.stempelzahl.werte));
  daten.streak.max=Math.max(...Object.values(daten.streak.werte));
  daten.neg_streak.min=Math.min(...Object.values(daten.neg_streak.werte));
  daten.neg_streak.max=20
}

function zeigeLeaderboard() {
  // Meiste Stempel
  const maxStempel=daten.stempelzahl.max;
  const personenStempel=Object.entries(daten.stempelzahl.werte)
    .filter(([n,v])=>v===maxStempel)
    .map(([n])=>n)
    .join(", ");
  document.getElementById("leaderStempel").textContent=
    `${personenStempel} hat mit ${maxStempel} Stempeln die meisten Stempel gesammelt.`;

  // Längste Streak
  const maxStreak=daten.streak.max;
  const personenStreak=Object.entries(daten.streak.werte)
    .filter(([n,v])=>v===maxStreak)
    .map(([n])=>n)
    .join(", ");
  // Start/End-Stempel
  const nameStreak=personenStreak.split(",")[0]; // falls mehrere, nimm die erste
  const streakInfo=streakTabelle[nameStreak].streak;
  document.getElementById("leaderStreak").textContent=
    `${nameStreak} hat mit ${streakInfo.length} Stempeln in Folge von ${streakInfo.startStempel} bis ${streakInfo.endStempel} die längste Streak.`;

  // Kürzeste Negative Streak
  const minNeg=daten.neg_streak.min;
  const personenNeg=Object.entries(daten.neg_streak.werte)
    .filter(([n,v])=>v===minNeg)
    .map(([n])=>n)
    .join(", ");
  const nameNeg=personenNeg.split(",")[0];
  const negInfo=streakTabelle[nameNeg].neg_streak;
  document.getElementById("leaderNegStreak").textContent=
    `${nameNeg} hat mit ${negInfo.length} fehlenden Stempeln in Folge von ${negInfo.startStempel} bis ${negInfo.endStempel} die kürzeste negative Streak.`;
}

// Alles zusammen
async function init() {
  await ladeUndVerarbeiteCSV();
  zeigeLeaderboard();
}

init();

document.addEventListener("DOMContentLoaded", function() {
    const box = document.getElementById("nudelbox");
    const img = document.getElementById("nudelbox-img");
    if (!box || !img) return;

    // initial state: check src for 'offen'
    let isOpen = img.src && img.src.includes('kasten_offen');

    // Sounds einbinden
    const openSound = new Audio('sounds/nudelbox_sound.mp3');     // Sound beim Öffnen
      openSound.volume = 0.3; 
    const closeSound = new Audio('sounds/kasten_zu_sound.mp3');   // Sound beim Schließen

    function toggleBox() {
        isOpen = !isOpen;

        // Bild wechseln
        img.src = isOpen ? 'images/kasten_offen.png' : 'images/kasten_geschlossen.png';

        // passenden Sound abspielen
        const soundToPlay = isOpen ? openSound : closeSound;
        soundToPlay.currentTime = 0;  // Reset, falls mehrfach geklickt
        soundToPlay.play();

        // Accessibility
        box.setAttribute('aria-pressed', String(isOpen));

        console.log('Nudelbox state:', isOpen ? 'open' : 'closed');
    }

    box.addEventListener('click', toggleBox);

    // keyboard support: Enter and Space
    box.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            toggleBox();
        }
    });
});
