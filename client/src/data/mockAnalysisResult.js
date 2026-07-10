export const mockAnalysisResult = {
  metrics: {
    priority: "Kısmen Uyumlu",
    consistency: 3,
    weaknesses: 4,
    recommendations: 6,
    expertReview: 5,
  },

  summary: {
    applicantName: "Bursa Büyükşehir Belediyesi",
    projectName:
      "Işık Kirliliği Yönetimine Yönelik Kurumsal Kapasitenin Geliştirilmesi",
    supportType: "Teknik Destek",
    duration: "180 Gün",
    location: "Bursa / Osmangazi",
    priority: "Kırsal Kalkınma",
    priorityStatus: "Kısmen Uyumlu",
  },

  priorityAlignment: {
    selectedPriority: "Kırsal Kalkınma",
    reason:
      "Başvuru içeriği kurumsal kapasite geliştirme ve yerel hizmet planlaması ile ilişkilidir. Ancak kırsal kalkınma, kırsal hedef grup veya kırsal ekonomik yapı ile bağlantı yeterince somutlaştırılmamıştır.",
    recommendation:
      "Başvurunun kırsal kalkınma önceliğiyle ilişkisi açık şekilde kurulmalı; hedef grup, faaliyet alanı ve beklenen etkiler kırsal boyut üzerinden detaylandırılmalıdır.",
  },

  consistencyFindings: [
    {
      title: "Eğitim ve danışmanlık süreleri netleştirilmeli",
      description:
        "Başvuru formunda toplam süre belirtilmiş ancak teknik şartnamede modül bazlı süreler daha açık yazılabilir.",
    },
    {
      title: "Teslim edilecek çıktılar detaylandırılmalı",
      description:
        "Rapor, rehber doküman ve eylem planının formatı ve teslim zamanı netleştirilebilir.",
    },
    {
      title: "Faaliyet çıktıları ile beklenen sonuçlar ilişkilendirilmeli",
      description:
        "Her faaliyetin hangi somut çıktıya katkı sağlayacağı daha açık gösterilmelidir.",
    },
  ],

  priceOfferAnalysis: [
    {
      title: "Fiyat farkı kontrol edilmeli",
      description:
        "Teklifler arasında anlamlı fiyat farkı varsa kapsamların aynı olup olmadığı kontrol edilmelidir.",
    },
    {
      title: "Teklif kapsamı şartnameyle karşılaştırılmalı",
      description:
        "Fiyat tekliflerinin teknik şartnamedeki tüm hizmetleri karşılayıp karşılamadığı incelenmelidir.",
    },
  ],

  performanceIndicators: [
    {
      title: "Göstergeler kısmen yeterli",
      description:
        "Eğitim ve danışmanlık göstergeleri mevcut ancak bazı hedef değerlerin gerekçesi güçlendirilebilir.",
    },
    {
      title: "Çıktılarla ilişki kurulmalı",
      description:
        "Göstergeler, proje çıktıları ve beklenen sonuçlarla daha açık ilişkilendirilmelidir.",
    },
  ],

  weakPoints: [
    {
      title: "Öncelik ile içerik uyumu zayıf",
      description:
        "Başvuruda seçilen öncelik ile proje içeriği arasındaki bağ yeterince açık kurulmamıştır.",
    },
    {
      title: "İhtiyaç analizi veriyle desteklenmeli",
      description:
        "İhtiyaç gerekçesi açıklanmış ancak sayısal veri ve kaynaklarla daha güçlü hale getirilebilir.",
    },
    {
      title: "Hedef grup daha net tanımlanmalı",
      description:
        "Hedef grubun görev alanı, kişi sayısı ve proje sonrası rolü daha açık yazılabilir.",
    },
    {
      title: "Sürdürülebilirlik mekanizması zayıf",
      description:
        "Proje sonrası çıktıların hangi birim tarafından nasıl kullanılacağı netleştirilmelidir.",
    },
  ],

  recommendations: [
    {
      title: "Öncelik bağlantısı güçlendirilmeli",
      description:
        "Faaliyetlerin seçilen önceliğe nasıl katkı sağladığı açık ve somut şekilde yazılmalıdır.",
    },
    {
      title: "Hedef grup detaylandırılmalı",
      description:
        "Hedef grup kişi sayısı, birim, görev ve ihtiyaç durumu üzerinden açıklanmalıdır.",
    },
    {
      title: "Teknik şartname çıktıları somutlaştırılmalı",
      description:
        "Teslim edilecek rapor, eğitim, rehber ve eylem planı gibi çıktılar açıkça tanımlanmalıdır.",
    },
    {
      title: "Performans göstergeleri güçlendirilmeli",
      description:
        "Göstergeler ölçülebilir, ulaşılabilir ve zamanla ilişkili şekilde yeniden yapılandırılmalıdır.",
    },
    {
      title: "Fiyat teklifleri kapsam açısından karşılaştırılmalı",
      description:
        "Tekliflerin aynı iş kapsamı için hazırlanıp hazırlanmadığı uzman tarafından kontrol edilmelidir.",
    },
    {
      title: "Sürdürülebilirlik planı eklenmeli",
      description:
        "Proje sonrası sorumlu birim, güncelleme periyodu ve kullanım süreci belirtilmelidir.",
    },
  ],

  expertReviewItems: [
    {
      title: "Tatbiki imza ve kaşe kontrolü",
      description:
        "İmza ve kaşe gibi görsel doğrulama gerektiren alanlar uzman tarafından incelenmelidir.",
    },
    {
      title: "Fiyat tekliflerinin kapsam karşılaştırması",
      description:
        "Tekliflerde sunulan hizmetlerin teknik şartnameyle aynı kapsamda olup olmadığı kontrol edilmelidir.",
    },
    {
      title: "Öncelik uyumu nihai değerlendirmesi",
      description:
        "Seçilen öncelik ile başvuru içeriği arasındaki ilişki uzman tarafından değerlendirilmelidir.",
    },
    {
      title: "Süre ve faaliyet planı uygulanabilirliği",
      description:
        "Planlanan faaliyetlerin belirtilen süre içinde uygulanabilirliği kontrol edilmelidir.",
    },
    {
      title: "Performans göstergelerinin yeterliliği",
      description:
        "Seçilen göstergelerin başvuru rehberi ve proje hedefleriyle uyumu incelenmelidir.",
    },
  ],
};