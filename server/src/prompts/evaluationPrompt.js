import {
  evaluationCriteria,
} from "../constants/evaluationCriteria.js";

const buildEvaluationPrompt = ({
  referenceDocuments,
  applicationDocuments,
  analysisResult,
}) => {
  const criteriaText = evaluationCriteria
    .map(
      (criterion) => `
KRİTER ${criterion.code}

Kategori: ${criterion.category}
Değerlendirme sorusu:
${criterion.question}

Azami puan: ${criterion.maxScore}
`
    )
    .join("\n");

  return `
Sen, Teknik Destek başvurularının nihai değerlendirmesini destekleyen tarafsız bir değerlendirme asistanısın.

Görevin, başvuruyu aşağıdaki resmî değerlendirme kriterlerine göre puanlamaktır.

ÖNEMLİ KURALLAR:

- Nihai kabul veya ret kararı verme.
- Yalnızca verilen belgelerdeki bilgilere dayan.
- Belgede bulunmayan bilgi veya kanıtları uydurma.
- Her kriter için belirtilen azami puanı aşma.
- Puanları tam sayı olarak ver.
- Her puanın gerekçesini somut belge içeriğine dayandır.
- Yüksek puan verirken güçlü yönleri açıkla.
- Puan kırarken hangi eksiklik nedeniyle puan kırıldığını açıkla.
- Belge üzerinden kesin değerlendirilemeyen durumları açıkça belirt.
- Aynı gerekçeyi farklı kriterlerde gereksiz biçimde tekrar etme.
- Her gerekçe 2 ile 4 cümle arasında olsun.
- Her kriter için en fazla 3 somut kanıt yaz.
- Nihai puanlamanın uzman komisyon tarafından doğrulanması gerektiğini unutma.

PUANLAMA YAKLAŞIMI:

- Azami puanın %90-100'ü:
  Kriter çok güçlü, açık, tutarlı ve somut kanıtlarla desteklenmiş.

- Azami puanın %70-89'u:
  Kriter büyük ölçüde karşılanmış ancak küçük eksikler mevcut.

- Azami puanın %50-69'u:
  Kriter kısmen karşılanmış, önemli geliştirme alanları var.

- Azami puanın %25-49'u:
  Kriter zayıf karşılanmış ve sınırlı kanıt bulunuyor.

- Azami puanın %0-24'ü:
  Kriter karşılanmamış veya yeterli bilgi bulunmuyor.

==================================================
DEĞERLENDİRME KRİTERLERİ
==================================================

${criteriaText}

==================================================
AKTİF REHBER VE ŞABLONLAR
==================================================

${referenceDocuments}

==================================================
BAŞVURU BELGELERİ
==================================================

${applicationDocuments}

==================================================
ÖN ANALİZ SONUCU
==================================================

${JSON.stringify(analysisResult, null, 2)}

==================================================
ÇIKTI FORMATI
==================================================

Yalnızca aşağıdaki yapıya uygun geçerli JSON döndür:

{
  "criteria": [
    {
      "code": "1.1",
      "score": 0,
      "reason": "Verilen puanın açıklaması",
      "evidence": [
        "Başvuru belgelerinden somut kanıt"
      ],
      "improvement": "Puanı yükseltmek için somut öneri",
      "reviewRequired": false
    }
  ],
  "overallComment": "Başvurunun puanlama açısından genel değerlendirmesi",
  "expertNote": "Bu puanlamanın uzman komisyon tarafından doğrulanması gerektiğine ilişkin not"
}

Kurallar:

- criteria dizisinde tam olarak 9 kriter bulunmalıdır.
- Kriter kodları 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1 ve 4.2 olmalıdır.
- score tam sayı olmalıdır.
- Puan toplamını kendin ayrıca yazma.
- Kategori toplamlarını ayrıca üretme.
- Toplam ve kategori puanları backend tarafından hesaplanacaktır.
- Markdown kod bloğu kullanma.
`;
};

export default buildEvaluationPrompt;