const evaluationCriteria = [
  {
    code: "1.1",
    categoryCode: "1",
    category: "İhtiyaç ve Sorunlar",
    question:
      "Teknik destek başvurusunun amacı iyi tanımlanmış, ihtiyaç ve sorunlar ile açık ve net bir şekilde ilişkilendirilmiş ve başvuru doğrudan belirtilen ihtiyaç ve sorunları karşılamaya yönelik çözümler içeriyor mu?",
    maxScore: 10,
  },
  {
    code: "1.2",
    categoryCode: "1",
    category: "İhtiyaç ve Sorunlar",
    question:
      "Bölgenin sorunları ve ihtiyaçları nitel ve nicel düzeyde verilerle desteklenerek açıklanmış mı? Kamu kurumu verileri, kamuoyu araştırmaları, üniversite yayınları veya meslek odası verileri kullanılmış mı?",
    maxScore: 10,
  },
  {
    code: "2.1",
    categoryCode: "2",
    category: "İlgililik",
    question:
      "Başvuru, teknik destek programının amacı ve önceliklerine ne kadar uygun?",
    maxScore: 15,
  },
  {
    code: "2.2",
    categoryCode: "2",
    category: "İlgililik",
    question:
      "Başvuru, bölgenin ihtiyaç ve sorunlarıyla ne kadar ilgili? Hedef grupların gereksinimleri ve seçilme nedenleri ne kadar iyi açıklanmış?",
    maxScore: 15,
  },
  {
    code: "3.1",
    categoryCode: "3",
    category: "Katma Değer",
    question:
      "Teknik destek başvurusu, bölgesel kalkınma açısından önem arz eden çalışmalara yönelik katma değer yaratıcı unsurları ne kadar içermekte?",
    maxScore: 10,
  },
  {
    code: "3.2",
    categoryCode: "3",
    category: "Katma Değer",
    question:
      "Teknik destek başvurusu kapsamında yapılacak faaliyetler kurumsal nitelikli ve kapasite geliştirici unsurları ne kadar içermekte?",
    maxScore: 10,
  },
  {
    code: "3.3",
    categoryCode: "3",
    category: "Katma Değer",
    question:
      "Öngörülen harcama veya bütçe, teknik destek içeriğinin uygulanabilirliği açısından yeterli, gerçekçi ve belirlenen ihtiyaç ve sorunlarla uyumlu mu?",
    maxScore: 10,
  },
  {
    code: "4.1",
    categoryCode: "4",
    category: "Sürdürülebilirlik ve Çarpan Etkisi",
    question:
      "Başvurunun beklenen sonuçları kurumsal ve mali açıdan sürdürülebilirlik içermekte mi?",
    maxScore: 10,
  },
  {
    code: "4.2",
    categoryCode: "4",
    category: "Sürdürülebilirlik ve Çarpan Etkisi",
    question:
      "Başvurunun çarpan etkileri; faaliyet sonuçlarının yinelenmesi, daha geniş alanları etkilemesi ve bilgi yayılması dâhil olmak üzere mevcut mu ve iyi tanımlanmış mı?",
    maxScore: 10,
  },
];

const evaluationCategories = [
  {
    code: "1",
    title: "İhtiyaç ve Sorunlar",
    maxScore: 20,
  },
  {
    code: "2",
    title: "İlgililik",
    maxScore: 30,
  },
  {
    code: "3",
    title: "Katma Değer",
    maxScore: 30,
  },
  {
    code: "4",
    title: "Sürdürülebilirlik ve Çarpan Etkisi",
    maxScore: 20,
  },
];

export {
  evaluationCriteria,
  evaluationCategories,
};