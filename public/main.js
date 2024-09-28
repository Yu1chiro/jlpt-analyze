// Fungsi untuk melakukan fetch API URL dari server
async function getGeminiApiUrl() {
  try {
      const response = await fetch('/api/geminiApiUrl');
      const data = await response.json();
      return data.geminiApiUrl; // Mengembalikan URL API dari server
  } catch (error) {
      console.error("Error fetching Gemini API URL:", error);
      throw error;
  }
}

// Fungsi untuk memformat teks
function formatText(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  text = text.replace(/\*(.*?)\*/g, '<i>$1</i>');
  text = text.replace(/~~(.*?)~~/g, '<s>$1</s>');
  text = text.replace(/^#\s+(.*)/gm, '<h1>$1</h1>');
  text = text.replace(/^##\s+(.*)/gm, '<h2>$1</h2>');
  text = text.replace(/^###\s+(.*)/gm, '<h3>$1</h3>');
  text = text.replace(/^>\s+(.*)/gm, '<blockquote>$1</blockquote>');
  text = text.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
  text = text.replace(/\n(?!<\/?(h1|h2|h3|blockquote|pre|code)>)/g, '<br>');

  return text;
}

// Event listener untuk submit form
document.getElementById("submit-analyze").addEventListener("click", async function (event) {
  event.preventDefault(); // Mencegah form reload halaman

  // Ambil nilai dari input form
  const jlptLevel = document.getElementById("category").value.trim();
  const vocabularyScore = document.getElementById("Vocalbullary").value.trim();
  const readingScore = document.getElementById("Reading").value.trim();
  const listeningScore = document.getElementById("Listening").value.trim();

  // Validasi input
  if (jlptLevel === "" || vocabularyScore === "" || readingScore === "" || listeningScore === "") {
      Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please complete all fields before analyzing!',
      });
      return;
  }

  // Show loading message
  Swal.fire({
      title: 'Please Waiting ✨✨',
      allowOutsideClick: false,
      didOpen: () => {
          Swal.showLoading();
      }
  });

  try {
      // Ambil API URL dari server
      const apiUrl = await getGeminiApiUrl();

      // Siapkan prompt untuk API
      const prompt = `
            Sebagai analis JLPT profesional, berikan analisis mendalam terhadap hasil tryout JLPT berikut, dengan memperhatikan passing grade untuk masing-masing level yang sesuai dengan ketentuan Japan Foundation:

        Total minimal Passing Grade:
        - N2 minimal: 90 poin
        - N3 minimal: 90 poin
        - N4 minimal: 95 poin
        - N5 minimal: 90 poin

        Instruksi analisis:
        1. Hitung total skor dengan menjumlahkan Vocabulary/Grammar Score, Reading Score, dan Listening Score.
        2. Tentukan status kelulusan dengan mengikuti aturan berikut tanpa pengecualian:
           - Jika level adalah N4 dan total skor >= 95, status adalah LULUS
           - Jika level adalah N4 dan total skor < 95, status adalah TIDAK LULUS
           - Jika level adalah N2, N3, atau N5 dan total skor >= 90, status adalah LULUS
           - Jika level adalah N2, N3, atau N5 dan total skor < 90, status adalah TIDAK LULUS
        3. Berikan evaluasi terperinci untuk setiap bidang yang diuji (Vocabulary/Grammar, Reading, Listening).
        4. Untuk setiap bidang, berikan saran dan rekomendasi yang jelas dan profesional untuk mempertahankan atau meningkatkan performa.
        5. Jika status LULUS, berikan dorongan dan keyakinan kepada pengguna untuk melanjutkan ke ujian JLPT resmi.
        6. Jika status TIDAK LULUS, berikan motivasi dan strategi untuk meningkatkan skor.
        7. Berikan rekomendasi umum untuk persiapan ujian JLPT selanjutnya.

        Skor Try out JLPT user :
        Level: ${jlptLevel}
        (漢字.文字語彙.文法) Vocabulary/Grammar Score: ${vocabularyScore}
        (読解) Reading Score: ${readingScore}
        (聴解) Listening Score: ${listeningScore}.

      `;

      // Panggil API dengan fetch
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              contents: [{
                  parts: [{
                      text: prompt
                  }]
              }]
          })
      });

      const data = await response.json();
      if (response.ok) {
          const paraphrasedText = data.candidates[0].content.parts[0].text;

          // Hide the SweetAlert loading message
          Swal.close();

          // Format teks yang dihasilkan dengan fungsi formatText
          const formattedText = formatText(paraphrasedText);

          // Tampilkan hasil analisis di modal dengan HTML yang sudah diformat
          document.getElementById("outputText").innerHTML = formattedText;

          // Tampilkan modal hasil analisis
          document.getElementById("modal-output").style.display = "block";

          // Scroll ke posisi tertentu setelah hasil ditampilkan
          const scrollPercentage = 80;
          const scrollPosition = (document.body.scrollHeight * scrollPercentage) / 100;
          window.scrollTo({
              top: scrollPosition,
              behavior: "smooth"
          });
      } else {
          throw new Error(data.error?.message || 'Failed to analyze the scores.');
      }
  } catch (error) {
      console.error('Error:', error);
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'An unexpected error occurred.',
      });
  }
});
