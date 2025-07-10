// export type DataItem = {
//   month: string
//   Penetapan: number
//   Optimasi: number
//   Realisasi: number
// }

// export type RawData = {
//   [year: string]: {
//     [category: string]: DataItem[]
//   }
// }

// const rawData: RawData = {
//   "2023": {
//     "Perjalanan Dinas Non Diklat": [
//       { month: "January", Penetapan: 89805173, Optimasi: 86025273, Realisasi: 89805173 },
//       { month: "February", Penetapan: 198709192, Optimasi: 190345522, Realisasi: 121583188 },
//       { month: "March", Penetapan: 326202845, Optimasi: 312472968, Realisasi: 270963528 },
//       { month: "April", Penetapan: 383903895, Optimasi: 367745380, Realisasi: 315171910 },
//       { month: "May", Penetapan: 472565932, Optimasi: 452675632, Realisasi: 352067888 },
//       { month: "June", Penetapan: 561837115, Optimasi: 538189391, Realisasi: 375648672 },
//       { month: "July", Penetapan: 678775243, Optimasi: 650205594, Realisasi: 442276393 },
//       { month: "August", Penetapan: 795713372, Optimasi: 762221796, Realisasi: 541960565 },
//       { month: "September", Penetapan: 923361827, Optimasi: 884497528, Realisasi: 726745989 },
//       { month: "October", Penetapan: 1040299955, Optimasi: 996513730, Realisasi: 927748119 },
//       { month: "November", Penetapan: 1183282257, Optimasi: 1133477907, Realisasi: 1056632113 },
//       { month: "December", Penetapan: 1300220385, Optimasi: 1245494109, Realisasi: 1280360924 }
//     ],
//   },
//   "2024": {
//     "Perjalanan Dinas Non Diklat": [
//       { month: "January", Penetapan: 89805173, Optimasi: 86025273, Realisasi: 89805173 },
//       { month: "February", Penetapan: 198709192, Optimasi: 190345522, Realisasi: 121583188 },
//       { month: "March", Penetapan: 326202845, Optimasi: 312472968, Realisasi: 270963528 },
//       { month: "April", Penetapan: 383903895, Optimasi: 367745380, Realisasi: 315171910 },
//       { month: "May", Penetapan: 472565932, Optimasi: 452675632, Realisasi: 352067888 },
//       { month: "June", Penetapan: 561837115, Optimasi: 538189391, Realisasi: 375648672 },
//       { month: "July", Penetapan: 678775243, Optimasi: 650205594, Realisasi: 442276393 },
//       { month: "August", Penetapan: 795713372, Optimasi: 762221796, Realisasi: 541960565 },
//       { month: "September", Penetapan: 923361827, Optimasi: 884497528, Realisasi: 726745989 },
//       { month: "October", Penetapan: 1040299955, Optimasi: 996513730, Realisasi: 927748119 },
//       { month: "November", Penetapan: 1183282257, Optimasi: 1133477907, Realisasi: 1056632113 },
//       { month: "December", Penetapan: 1300220385, Optimasi: 1245494109, Realisasi: 1280360924 }
//     ],
//     "Bahan Makanan & Konsumsi": [
//       { month: "January", Penetapan: 28465000, Optimasi: 28465000, Realisasi: 28465000 },
//       { month: "February", Penetapan: 70709218, Optimasi: 70709218, Realisasi: 55432550 },
//       { month: "March", Penetapan: 105109097, Optimasi: 105109097, Realisasi: 98272550 },
//       { month: "April", Penetapan: 148072277, Optimasi: 148072277, Realisasi: 137702917 },
//       { month: "May", Penetapan: 234459621, Optimasi: 234459621, Realisasi: 172485017 },
//       { month: "June", Penetapan: 275712781, Optimasi: 275712781, Realisasi: 202460317 },
//       { month: "July", Penetapan: 304463781, Optimasi: 304463781, Realisasi: 235047995 },
//       { month: "August", Penetapan: 330858706, Optimasi: 330858706, Realisasi: 274860695 },
//       { month: "September", Penetapan: 359003211, Optimasi: 359003211, Realisasi: 296394337 },
//       { month: "October", Penetapan: 391859480, Optimasi: 391859480, Realisasi: 353768737 },
//       { month: "November", Penetapan: 420927641, Optimasi: 420927641, Realisasi: 392129573 },
//       { month: "December", Penetapan: 445977704, Optimasi: 445977704, Realisasi: 433223398 }
//     ],
//     "Alat dan Keperluan Kantor": [
//       { month: "January", Penetapan: 28058564, Optimasi: 25213706, Realisasi: 28058564 },
//       { month: "February", Penetapan: 49722954, Optimasi: 44681544, Realisasi: 50444564 },
//       { month: "March", Penetapan: 74103105, Optimasi: 66589791, Realisasi: 89009226 },
//       { month: "April", Penetapan: 98370386, Optimasi: 88396612, Realisasi: 106208726 },
//       { month: "May", Penetapan: 121199068, Optimasi: 108910695, Realisasi: 102397626 },
//       { month: "June", Penetapan: 144775226, Optimasi: 130096466, Realisasi: 112726626 },
//       { month: "July", Penetapan: 169546437, Optimasi: 152356124, Realisasi: 143975026 },
//       { month: "August", Penetapan: 190068864, Optimasi: 170797782, Realisasi: 163548526 },
//       { month: "September", Penetapan: 209214882, Optimasi: 188002586, Realisasi: 182133526 },
//       { month: "October", Penetapan: 232980741, Optimasi: 209358823, Realisasi: 207987526 },
//       { month: "November", Penetapan: 269762371, Optimasi: 242411165, Realisasi: 226904526 },
//       { month: "December", Penetapan: 312722708, Optimasi: 281015753, Realisasi: 246512526 }
//     ],
//     "Barang Cetakan": [
//       { month: "January", Penetapan: 14140250, Optimasi: 13998988, Realisasi: 14140250 },
//       { month: "February", Penetapan: 23874493, Optimasi: 23635987, Realisasi: 24198750 },
//       { month: "March", Penetapan: 31248360, Optimasi: 30936188, Realisasi: 32450500 },
//       { month: "April", Penetapan: 40261642, Optimasi: 39859428, Realisasi: 48391628 },
//       { month: "May", Penetapan: 47010323, Optimasi: 46540689, Realisasi: 11767672 },
//       { month: "June", Penetapan: 58154580, Optimasi: 57573616, Realisasi: 14955012 },
//       { month: "July", Penetapan: 64370663, Optimasi: 63727600, Realisasi: 47667890 },
//       { month: "August", Penetapan: 81224048, Optimasi: 80412620, Realisasi: 52856490 },
//       { month: "September", Penetapan: 86263340, Optimasi: 85401569, Realisasi: 55956490 },
//       { month: "October", Penetapan: 91196240, Optimasi: 90285190, Realisasi: 61639490 },
//       { month: "November", Penetapan: 106497224, Optimasi: 105433316, Realisasi: 71899490 },
//       { month: "December", Penetapan: 114375763, Optimasi: 113233149, Realisasi: 85237240 }
//     ]
//   }
// }; export default rawData;