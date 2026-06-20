// Base CIQUAL - aliments courants (extrait)
// Format: [id, nom, kcal, p, c, f]
export const CIQUAL_RAW = [
  [9104,"Riz blanc, cuit",155,3.1,33.2,0.7],
  [9811,"Pates seches, standard, cuites",167,6.1,31.4,1.1],
  [9341,"Quinoa, cuit",149,4.7,27.9,1.1],
  [9691,"Boulgour de ble, cuit",131,4.3,24.1,1.0],
  [9683,"Semoule ou couscous, cuit",164,5.8,31.0,0.9],
  [4003,"Pomme de terre, bouillie",81,1.8,16.8,0.3],
  [7001,"Pain blanc (baguette)",287,8.3,58.3,1.4],
  [7110,"Pain complet",234,8.7,41.2,1.7],
  [32140,"Flocons d'avoine",369,10.6,57.7,7.8],
  [36018,"Poulet, filet sans peau grille",141,30.1,0.0,2.0],
  [36306,"Dinde, escalope grilee",124,28.5,0.0,1.1],
  [6200,"Boeuf, steak grille",128,27.6,0.0,1.9],
  [6251,"Boeuf, steak hache 5% MG cuit",155,25.5,0.0,5.8],
  [6253,"Boeuf, steak hache 10% MG cuit",210,26.1,0.0,11.8],
  [28900,"Jambon cuit superieur",113,21.0,0.8,2.8],
  [28800,"Jambon cru",239,25.9,4.3,13.2],
  [26038,"Saumon, cuit a la vapeur",199,23.0,0.9,11.5],
  [26039,"Thon, au naturel, egoutte",143,26.8,0.0,3.9],
  [26037,"Saumon fume",184,22.2,0.1,10.5],
  [22010,"Oeuf dur",134,13.5,0.5,8.6],
  [22000,"Oeuf cru",140,12.8,0.1,9.8],
  [12118,"Emmental rape",368,27.6,0.6,28.2],
  [12001,"Camembert",280,19.5,0.0,22.5],
  [12110,"Comte",413,27.8,0.0,33.8],
  [19593,"Yaourt nature",50,3.8,4.3,1.7],
  [19860,"Yaourt a la grecque nature",103,3.0,3.7,8.2],
  [19644,"Fromage blanc 0%",48,7.3,4.2,0.1],
  [19646,"Fromage blanc 2-3%",76,7.3,3.9,3.2],
  [19033,"Lait demi-ecreme",48,3.5,5.0,1.6],
  [13005,"Banane",88,1.1,19.7,0.5],
  [13039,"Pomme",54,0.2,11.6,0.2],
  [13034,"Orange",42,0.8,8.0,0.5],
  [13014,"Fraise",35,0.6,6.0,0.5],
  [13028,"Myrtille",58,0.9,10.6,0.3],
  [13025,"Mangue",71,0.6,14.3,0.5],
  [13004,"Avocat",203,1.6,0.0,20.6],
  [20009,"Carotte crue",30,0.8,5.2,0.5],
  [20020,"Courgette crue",17,1.2,1.8,0.3],
  [20057,"Brocoli cru",32,2.9,2.1,0.4],
  [20276,"Tomate ronde crue",18,0.5,3.4,0.5],
  [20031,"Laitue crue",15,1.4,1.2,0.2],
  [20059,"Epinard cru",33,2.7,3.1,0.4],
  [20061,"Haricot vert cru",32,1.8,4.1,0.2],
  [20072,"Petits pois crus",81,5.4,11.4,0.4],
  [20056,"Champignon de Paris cru",21,2.1,1.8,0.4],
  [20503,"Haricot rouge, cuit",116,9.6,12.3,0.6],
  [20360,"Lentille, cuite",125,10.1,16.2,0.6],
  [20507,"Pois chiche, cuit",148,8.3,17.7,3.0],
  [15000,"Amande",615,18.8,9.5,51.3],
  [15001,"Cacahuete",623,22.8,14.8,49.1],
  [15005,"Noix",709,13.3,6.9,67.3],
  [31016,"Sucre blanc",399,0.0,99.7,0.0],
  [31032,"Pate a tartiner chocolat-noisette",549,5.0,57.9,32.4],
  [31008,"Miel",331,0.7,82.1,0.0],
  [17270,"Huile d'olive",899,0.2,0.0,99.9],
  [16400,"Beurre doux",753,0.6,0.7,83.0],
  [18020,"The infuse",0,0.1,0.0,0.0],
  [18004,"Cafe",6,0.2,1.4,0.0],
  [2070,"Jus d'orange, pur jus",45,0.6,9.6,0.1],
  [18018,"Cola sucre",40,0.0,10.0,0.0],
  [20904,"Tofu nature",147,13.4,2.9,8.5],
  [9310,"Avoine crue",378,16.9,55.7,6.9],
  [15202,"Beurre de cacahuete",643,22.2,17.3,51.4],
  [11054,"Mayonnaise",692,1.3,3.4,74.5],
  [11008,"Ketchup",108,1.2,23.7,0.2],
  [25456,"Sushi ou maki",171,6.7,26.9,3.7],
  [25081,"Lasagnes bolognaise",134,6.3,13.5,5.7],
  [25413,"Hamburger restauration rapide",251,13.3,29.5,8.4],
  [25404,"Pizza margherita",224,8.6,29.6,7.4],
  [25435,"Pizza jambon fromage",228,10.7,26.2,8.5],
]

export function searchCiqual(query, limit = 50) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').trim()
  const words = q.split(/\s+/).filter(Boolean)
  const results = []
  for (const row of CIQUAL_RAW) {
    const name = row[1].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (words.every(w => name.includes(w))) {
      results.push({ id: 'ci' + row[0], name: row[1], unit: 'g', kcal: row[2], p: row[3], c: row[4], f: row[5] })
      if (results.length >= limit) break
    }
  }
  return results
}
