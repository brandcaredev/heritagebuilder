"use client";
import React, { useState } from "react";

const HungarianTerms = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (sectionId: number) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          FELHASZNÁLÁSI FELTÉTELEK
        </h1>
        <p className="italic text-gray-600">Utolsó frissítés: 2025.03.07.</p>
      </div>

      <div className="mb-6">
        <p className="text-gray-700">
          Ez a dokumentum a <strong>heritagebuilder.eu</strong> weboldal
          használatának feltételeit tartalmazza. A weboldal használatával a
          felhasználók elfogadják az alábbi feltételeket.
        </p>
      </div>

      {/* Section 1 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(1)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            1. Általános rendelkezések
          </h2>
          <span className="text-blue-500">
            {expandedSection === 1 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 1 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              1.1. A <strong>heritagebuilder.eu</strong> egy közösségi alapú
              platform, amely épületekről és azok történelméről gyűjt
              információkat.
            </p>
            <p className="mb-2">
              1.2. A weboldal célja, hogy a felhasználók megoszthassák és
              bővíthessék a történelmi épületekhez kapcsolódó információkat,
              képeket és adatokat.
            </p>
            <p className="mb-2">
              1.3. A weboldal tulajdonosa és üzemeltetője fenntartja a jogot a
              feltöltött tartalmak ellenőrzésére, szerkesztésére és
              eltávolítására.
            </p>
          </div>
        )}
      </div>

      {/* Section 2 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(2)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            2. Felhasználói regisztráció és jogosultságok
          </h2>
          <span className="text-blue-500">
            {expandedSection === 2 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 2 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              2.1. A weboldal használatához regisztráció szükséges. A
              felhasználó köteles valós adatokat megadni a regisztráció során.
            </p>
            <p className="mb-2">
              2.2. Csak <strong>18. életévüket betöltött személyek</strong>{" "}
              használhatják a weboldalt.
            </p>
            <p className="mb-2">
              2.3. A felhasználók saját felelősségükre töltenek fel tartalmakat,
              és vállalják, hogy azok nem sértik mások szerzői jogait,
              személyiségi jogait vagy egyéb jogait.
            </p>
            <p className="mb-2">
              2.4. A közösségi szerkesztés funkció csak a weboldal által
              jóváhagyott felhasználók számára érhető el.
            </p>
          </div>
        )}
      </div>

      {/* Section 3 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(3)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            3. Tartalomfeltöltés és szerkesztés
          </h2>
          <span className="text-blue-500">
            {expandedSection === 3 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 3 && (
          <div className="mt-3 pl-4 text-gray-700">
            <h3 className="mb-2 font-semibold">
              3.1. Képek és egyéb tartalmak feltöltése
            </h3>
            <p className="mb-2 pl-2">
              3.1.1. A felhasználók{" "}
              <strong>képeket, leírásokat és egyéb információkat</strong>{" "}
              tölthetnek fel meglévő épületadatlapokhoz.
            </p>
            <p className="mb-2 pl-2">
              3.1.2. A feltöltött képeknek és szövegeknek{" "}
              <strong>meg kell felelniük a szerzői jogi előírásoknak</strong>. A
              felhasználó kizárólag olyan tartalmat tölthet fel, amelyet:
            </p>
            <ul className="mb-2 list-disc pl-8">
              <li>
                Ő maga készített és saját szellemi tulajdonát képezi, vagy
              </li>
              <li>
                Olyan forrásból származik, amely{" "}
                <strong>engedélyezi az adott típusú felhasználást</strong>.
              </li>
            </ul>
            <p className="mb-4 pl-2">
              3.1.3. A feltöltéssel a felhasználó{" "}
              <strong>nem kizárólagos, de visszavonhatatlan</strong>{" "}
              felhasználási jogot biztosít a heritagebuilder.eu számára.
            </p>

            <h3 className="mb-2 font-semibold">
              3.2. Harmadik felek jogai és jogsértési panaszok kezelése
            </h3>
            <p className="mb-2 pl-2">
              3.2.1.1. Amennyiben egy harmadik fél bejelenti, hogy egy
              feltöltött tartalom sérti szerzői jogait, a heritagebuilder.eu
              fenntartja a jogot, hogy:
            </p>
            <ul className="mb-4 list-disc pl-8">
              <li>
                <strong>Ideiglenesen eltávolítsa a tartalmat</strong> a panasz
                kivizsgálásának idejére.
              </li>
              <li>
                <strong>Kapcsolatba lépjen az érintett felekkel</strong>, és
                kérje a jogszerűség igazolását.
              </li>
              <li>
                Ha a panasz jogosnak bizonyul,{" "}
                <strong>véglegesen eltávolítsa a tartalmat</strong>.
              </li>
            </ul>

            <h3 className="mb-2 font-semibold">
              3.3. A feltöltött tartalmak törlése és módosítása a felhasználó
              által
            </h3>
            <p className="mb-2 pl-2">
              3.3.1.1. A feltöltés után a felhasználók{" "}
              <strong>nem törölhetik önállóan a tartalmat</strong>, mivel az
              része lesz a weboldal közösségi adatbázisának.
            </p>
            <p className="mb-2 pl-2">
              3.3.1.2. A felhasználók azonban{" "}
              <strong>
                kérhetik a tartalom eltávolítását vagy módosítását
              </strong>
              , indokolt esetben.
            </p>
          </div>
        )}
      </div>

      {/* Section 4 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(4)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            4. Felelősségvállalás és korlátozások
          </h2>
          <span className="text-blue-500">
            {expandedSection === 4 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 4 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              4.1. A weboldal <strong>nem vállal felelősséget</strong> a
              felhasználók által feltöltött tartalmak pontosságáért vagy
              jogszerűségéért.
            </p>
            <p className="mb-2">
              4.2. A weboldal nem vállal felelősséget{" "}
              <strong>harmadik felek által bejelentett jogsértésekért</strong>,
              de minden ilyen esetben jogosult eltávolítani a kifogásolt
              tartalmat.
            </p>
            <p className="mb-2">
              4.3. A weboldal{" "}
              <strong>nem garantálja a folyamatos elérhetőséget</strong> vagy a
              technikai hibák elkerülését.
            </p>
          </div>
        )}
      </div>

      {/* Section 5 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(5)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            5. Szerzői jogok és adatvédelem
          </h2>
          <span className="text-blue-500">
            {expandedSection === 5 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 5 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              5.1. A weboldalon található tartalmak (felhasználói feltöltések
              kivételével) a{" "}
              <strong>
                Politikai Demográfia Közép-Európai Kutatóintézete Alapítvány
              </strong>{" "}
              tulajdonát képezik.
            </p>

            <div className="mb-4 rounded bg-gray-100 p-3">
              <p className="font-semibold">Tulajdonos és üzemeltető:</p>
              <p>
                📌 Politikai Demográfia Közép-Európai Kutatóintézete Alapítvány
              </p>
              <p>📍 Cím: 1084 Budapest, Víg utca 20. 3. emelet/7. a.</p>
              <p>🔢 Adószám: 19225201-1-42</p>
            </div>

            <p className="mb-2">
              5.2. A felhasználók által feltöltött tartalmakra{" "}
              <strong>
                nem kizárólagos, de korlátlan felhasználási jogot biztosítanak
              </strong>{" "}
              a weboldal üzemeltetői számára.
            </p>
            <p className="mb-2">
              5.3. A weboldal adatvédelmi szabályzata külön dokumentumban
              található, amely szabályozza a személyes adatok kezelését.
            </p>
          </div>
        )}
      </div>

      {/* Section 6 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(6)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            6. Tiltott tevékenységek
          </h2>
          <span className="text-blue-500">
            {expandedSection === 6 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 6 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              A felhasználók <strong>nem</strong> tölthetnek fel vagy tehetnek
              közzé olyan tartalmakat, amelyek:
            </p>
            <ul className="mb-2 list-disc pl-6">
              <li>Jogellenesek vagy mások jogait sértik.</li>
              <li>Hamis vagy félrevezető információkat tartalmaznak.</li>
              <li>
                Másokat zaklatnak, rágalmaznak vagy sértő módon ábrázolnak.
              </li>
              <li>
                Politikai vagy vallási szélsőséges nézeteket terjesztenek.
              </li>
              <li>
                Reklámok, promóciók vagy kereskedelmi célú tartalmak (kivéve
                engedélyezett esetben).
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Section 7 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(7)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            7. Joghatóság és jogvita rendezése
          </h2>
          <span className="text-blue-500">
            {expandedSection === 7 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 7 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              7.1. A felhasználási feltételekre{" "}
              <strong>
                Magyarország, Románia, Szerbia és az Európai Unió vonatkozó
                jogszabályai
              </strong>{" "}
              érvényesek.
            </p>
            <p className="mb-2">
              7.2. Vitás esetekben a felek elsődlegesen békés úton próbálják
              rendezni a konfliktust. Ha ez nem sikerül, a jogvita a{" "}
              <strong>
                weboldal üzemeltetőjének székhelye szerinti bíróság előtt
              </strong>{" "}
              kerül eldöntésre.
            </p>
          </div>
        )}
      </div>

      {/* Section 8 */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => toggleSection(8)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            8. Módosítások és érvényesség
          </h2>
          <span className="text-blue-500">
            {expandedSection === 8 ? "−" : "+"}
          </span>
        </div>

        {expandedSection === 8 && (
          <div className="mt-3 pl-4 text-gray-700">
            <p className="mb-2">
              8.1. Az üzemeltetők fenntartják a jogot, hogy a Felhasználási
              Feltételeket <strong>bármikor módosítsák</strong>.
            </p>
            <p className="mb-2">
              8.2. A változások a weboldalon történő közzétételt követően lépnek
              életbe.
            </p>
            <p className="mb-2">
              8.3. A weboldal további használata a módosított feltételek
              elfogadását jelenti.
            </p>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Kapcsolat</h2>
        <p className="text-gray-700">
          Amennyiben kérdésed van a Felhasználási Feltételekkel kapcsolatban,
          lépj kapcsolatba az üzemeltetőkkel az alábbi elérhetőségen:
        </p>
        <p className="mt-2 font-medium">
          📧 Email:{" "}
          <a
            href="mailto:politikaidemografia.mail@gmail.com"
            className="text-blue-600 hover:underline"
          >
            politikaidemografia.mail@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default HungarianTerms;
