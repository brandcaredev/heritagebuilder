/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";

const HungarianCookiePolicy = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (sectionId: number) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-brown-100 p-6 shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-brown-900">
          SÜTI (COOKIE) SZABÁLYZAT
        </h1>
        <p className="italic text-brown-700">Utoljára frissítve: 2024.06.12</p>
      </div>

      <div className="mb-6">
        <p className="text-brown-900">
          Ez a Süti Szabályzat elmagyarázza, hogyan használja a{" "}
          <strong>heritagebuilder.eu</strong> a sütiket és hasonló
          technológiákat az Ön felismerésére, amikor meglátogatja weboldalunkat.
          Elmagyarázza, mik ezek a technológiák, miért használjuk őket, valamint
          az Ön jogait azok használatának szabályozására.
        </p>
      </div>

      {/* Section 1 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(1)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            1. Mik azok a sütik?
          </h2>
          <span className="text-green">
            {expandedSection === 1 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 1 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              A sütik olyan kis adatfájlok, amelyeket az Ön számítógépére vagy
              mobileszközére helyeznek, amikor meglátogat egy weboldalt. A
              sütiket a weboldal tulajdonosok széles körben használják, hogy
              weboldalaikat hatékonyan működtessék és jobb böngészési élményt
              biztosítsanak.
            </p>
          </div>
        )}
      </div>

      {/* Section 2 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(2)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            2. Hogyan használjuk a sütiket
          </h2>
          <span className="text-green">
            {expandedSection === 2 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 2 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              Weboldalunk a következő célokra használ sütiket:
            </p>

            <h3 className="mb-2 mt-4 font-semibold">Hitelesítés</h3>
            <p className="mb-2">
              Sütiket használunk az Ön azonosítására, amikor meglátogatja
              weboldalunkat és oldalról oldalra navigál. Ezek a sütik segítenek
              fenntartani a bejelentkezési munkamenetet és lehetővé teszik a
              weboldal korlátozott területeihez való hozzáférést.
            </p>

            <h3 className="mb-2 mt-4 font-semibold">Nyelvi beállítások</h3>
            <p className="mb-2">
              Sütiket használunk az Ön nyelvi beállításainak (angol vagy magyar)
              megjegyzésére a weboldalunk látogatásai között.
            </p>

            <h3 className="mb-2 mt-4 font-semibold">Munkamenet kezelés</h3>
            <p className="mb-2">
              Munkamenet sütiket használunk a munkamenet állapotának
              fenntartásához, miközben navigál a weboldalunkon. Ezek az
              ideiglenes sütik lejárnak, amikor bezárja a böngészőjét.
            </p>
          </div>
        )}
      </div>

      {/* Section 3 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(3)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            3. Sütik időtartama
          </h2>
          <span className="text-green">
            {expandedSection === 3 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 3 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              Az, hogy egy süti mennyi ideig marad az Ön eszközén, attól függ,
              hogy "állandó" vagy "munkamenet" sütiről van-e szó:
            </p>
            <ul className="mb-2 list-disc pl-6">
              <li>
                <strong>Munkamenet sütik</strong>: Ezek a sütik csak addig
                maradnak az eszközén, amíg be nem zárja a böngészőjét.
              </li>
              <li>
                <strong>Állandó sütik</strong>: A hitelesítési és preferencia
                sütik akár több hónapig is megmaradhatnak az eszközén, hogy
                emlékezzenek a bejelentkezési állapotára és preferenciáira.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Section 4 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(4)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            4. Süti kezelés
          </h2>
          <span className="text-green">
            {expandedSection === 4 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 4 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              A legtöbb webböngésző lehetővé teszi a sütik szabályozását a
              beállítások preferenciáin keresztül. Ha azonban korlátozza a
              weboldalak süti beállítási képességét, ronthatja az általános
              felhasználói élményt, és előfordulhat, hogy nem tudja használni
              weboldalunk bizonyos funkcióit, például a bejelentkezést vagy a
              személyre szabott tartalom elérését.
            </p>

            <h3 className="mb-2 mt-4 font-semibold">
              Hogyan törölhetők a sütik a gyakori böngészőkben:
            </h3>
            <ul className="mb-2 list-disc pl-6">
              <li>
                <strong>Chrome</strong>: Beállítások → Adatvédelem és biztonság
                → Sütik és egyéb oldaladatok
              </li>
              <li>
                <strong>Firefox</strong>: Beállítások → Adatvédelem és biztonság
                → Sütik és oldaladatok
              </li>
              <li>
                <strong>Safari</strong>: Beállítások → Adatvédelem → Weboldal
                adatok kezelése
              </li>
              <li>
                <strong>Edge</strong>: Beállítások → Adatvédelem, keresés és
                szolgáltatások → Böngészési adatok törlése
              </li>
            </ul>

            <p className="mb-2 mt-4">
              Kérjük, vegye figyelembe, hogy a sütik letiltása hatással lesz
              weboldalunk működésére. A sütik letiltása bizonyos funkciók és
              szolgáltatások letiltását eredményezheti ezen az oldalon,
              különösen a hitelesítéssel kapcsolatos funkciókat.
            </p>
          </div>
        )}
      </div>

      {/* Section 5 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(5)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            5. Az Ön hozzájárulása
          </h2>
          <span className="text-green">
            {expandedSection === 5 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 5 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              Weboldalunk további használatával Ön hozzájárul ahhoz, hogy
              szükséges sütiket helyezzünk el az eszközén. Ezek a sütik
              elengedhetetlenek a weboldal alapvető funkcióihoz.
            </p>
            <p className="mb-2">
              Ha nem kíván sütiket elfogadni a weboldalunkról, kérjük, zárja be
              a böngészőjét vagy hagyja abba az oldal használatát.
            </p>
          </div>
        )}
      </div>

      {/* Section 6 */}
      <div className="mb-4 border-t border-brown-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(6)}
        >
          <h2 className="text-xl font-semibold text-brown-900">
            6. Változtatások ebben a Süti Szabályzatban
          </h2>
          <span className="text-green">
            {expandedSection === 6 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 6 && (
          <div className="mt-3 pl-4 text-brown-900">
            <p className="mb-2">
              Időről időre frissíthetjük ezt a Süti Szabályzatot, hogy tükrözze
              a technológia, a szabályozás vagy az üzleti gyakorlatok
              változásait. Minden változtatás akkor lép hatályba, amikor a
              felülvizsgált Süti Szabályzatot közzétesszük a weboldalunkon.
            </p>
            <p className="mb-2">
              Javasoljuk, hogy rendszeresen tekintse meg ezt az oldalt, hogy
              tájékozódjon a sütik használatáról.
            </p>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="mt-6 border-t border-brown-200 pt-6">
        <h2 className="mb-3 text-xl font-semibold text-brown-900">Kapcsolat</h2>
        <p className="text-brown-900">
          Ha bármilyen kérdése van ezzel a Süti Szabályzattal kapcsolatban,
          vegye fel a kapcsolatot a weboldal üzemeltetőivel:
        </p>
        <p className="mt-2 font-medium">
          📧 Email:{" "}
          <a
            href="mailto:politikaidemografia.mail@gmail.com"
            className="text-green hover:underline"
          >
            politikaidemografia.mail@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default HungarianCookiePolicy;
