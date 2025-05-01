export const generatelevels = () => {
  const levels = [];

  let x = 0.07; //Ahol x a szintek közötti tapasztalat hányadosa
  let y = 0.2; //Ahol y a szintek közötti tapasztalat hatványa
  let md = 10; //Ahol md a szintek közötti tapasztalat minimum differenciája
  let exp = 0; //Szintek tapasztalatának alsó kolátja
  let lvl = 1; //Szintek változója
  let diff = 50; //Szintek közötti differencia kiindulási értéke

  //Kiindulási pont objektummal
  levels.push({
    exp,
    lvl,
    diff,
  });

  //Az számtani sorozat megvalósítása for ciklussal
  //Minden iterációnál kiszámítja az imént említett változók értékét minden szintre értelmezve
  for (let index = 1; index < 256; index++) {
    exp += diff; //Következő szint alsó határának mehatározása
    lvl = index + 1; //Következő szint száma
    const d = lvl / x; //Következő szint hányadosának kiszámolása
    diff += Math.round(Math.pow(d, y) + md); //Következő szint
    levels.push({ exp, lvl, diff }); //Következő szint objektomának mentése
  }

  console.log(levels);
};
