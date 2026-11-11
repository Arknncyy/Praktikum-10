const containerPortofolio = document.querySelector("#container-portofolio");
const loadingIndicator = document.querySelector("#loading");
const btnTema = document.querySelector("#btn-tema");
const btnInfo = document.querySelector("#btn-info");
const kotakAside = document.querySelector("aside");
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const pesanError = document.querySelector("#pesan-error");
const btnHapusSemua = document.querySelector("#btn-hapus-semua");
const inputNama = document.querySelector("#input-nama");
const inputPesan = document.querySelector("#input-pesan");
const formPortofolio = document.querySelector("#form-portofolio");
const btnReset = document.querySelector("#btn-reset");


function pesanDariStatus(status) {
    if (status === 404) return "Data tidak ditemukan di server.";
    if (status === 400) return "Data yang dikirim tidak valid.";
    if (status >= 500) return "Server sedang bermasalah, coba lagi nanti.";
    return "Terjadi kesalahan tidak terduga (Status: " + status + ").";
}


function inisialisasiDataAwal() {
    if (!localStorage.getItem("tema")) {
        localStorage.setItem("tema", "light");
    }
}
inisialisasiDataAwal();

function toggleTema() {
    document.body.classList.toggle("dark-mode");
    const temaSekarang = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("tema", temaSekarang);
    if (btnTema) {
        btnTema.textContent = temaSekarang === "dark" ? "Mode Terang" : "Mode Gelap";
    }
}

function muatPreferensiTema() {
    const tema = localStorage.getItem("tema");
    if (tema === "dark") {
        document.body.classList.add("dark-mode");
        if (btnTema) btnTema.textContent = "Mode Terang";
    } else {
        document.body.classList.remove("dark-mode");
        if (btnTema) btnTema.textContent = "Mode Gelap";
    }
}

if (btnTema) btnTema.addEventListener("click", toggleTema);

document.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement.tagName;
    if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;
    if (e.key.toLowerCase() === "d") toggleTema();
});

function muatStatusAside() {
    const statusAside = localStorage.getItem("statusAside");
    if (statusAside === "tersembunyi" && kotakAside) {
        kotakAside.classList.add("tersembunyi");
    }
}

if (btnInfo && kotakAside) {
    btnInfo.addEventListener("click", () => {
        kotakAside.classList.toggle("tersembunyi");
        const isHidden = kotakAside.classList.contains("tersembunyi");
        localStorage.setItem("statusAside", isHidden ? "tersembunyi" : "tampil");
    });
}


async function perbaruiLikeKeServer(postId, jumlahLike) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ likes: jumlahLike })
        });

        if (!response.ok) {
            throw new Error(pesanDariStatus(response.status));
        }

        console.log(`Like untuk post #${postId} berhasil diperbarui di server menjadi ${jumlahLike}`);
    } catch (error) {
        console.error("Gagal memperbarui like ke server:", error.message);
    }
}

function renderItemPortofolio(item) {
    const article = document.createElement("article");
    if (item.id) article.dataset.id = item.id;

    const judul = document.createElement("h3");
    judul.textContent = item.judul;

    const waktu = document.createElement("p");
    waktu.innerHTML = `<time>${item.waktu}</time>`;

    const deskripsi = document.createElement("p");
    deskripsi.textContent = item.deskripsi;

    const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
    let jumlahLike = semuaLike[item.judul] || 0;

    const tombolLike = document.createElement("button");
    tombolLike.textContent = `Like (${jumlahLike})`;
    tombolLike.dataset.like = jumlahLike;
    tombolLike.style.marginRight = "8px";

    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus Item";
    tombolHapus.classList.add("btn-danger");

    article.appendChild(judul);
    article.appendChild(waktu);
    article.appendChild(deskripsi);
    article.appendChild(tombolLike);
    article.appendChild(tombolHapus);

    containerPortofolio.appendChild(article);
}

async function muatPortofolioDariAPI() {
    if (!containerPortofolio) return;
    
    if (loadingIndicator) loadingIndicator.classList.remove("tersembunyi");

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=4");
        if (!response.ok) throw new Error(pesanDariStatus(response.status));

        const dataPosts = await response.json();
        containerPortofolio.innerHTML = "";

        dataPosts.forEach((post) => {
            renderItemPortofolio({
                id: post.id,
                judul: post.title,
                waktu: `Proyek #${post.id}`,
                deskripsi: post.body
            });
        });

    } catch (error) {
        containerPortofolio.innerHTML = `<p class='error-msg'>${error.message}</p>`;
        console.error("Gagal mengambil data portofolio:", error);
    } finally {
        if (loadingIndicator) loadingIndicator.classList.add("tersembunyi");
    }
}

if (containerPortofolio) {
    containerPortofolio.addEventListener("mouseover", (e) => {
        const article = e.target.closest("article");
        if (article) article.classList.add("artikel-hover");
    });

    containerPortofolio.addEventListener("mouseout", (e) => {
        const article = e.target.closest("article");
        if (article) article.classList.remove("artikel-hover");
    });

    containerPortofolio.addEventListener("click", async (e) => {
        if (e.target.tagName === "BUTTON" && e.target.textContent === "Hapus Item") {
            e.target.closest("article").remove();
        }

        if (e.target.tagName === "BUTTON" && e.target.textContent.startsWith("Like")) {
            const article = e.target.closest("article");
            const judul = article.querySelector("h3").textContent;
            const postId = article.dataset.id || 1;
            
            let jumlah = parseInt(e.target.dataset.like || 0);
            jumlah++;
            e.target.dataset.like = jumlah;
            e.target.textContent = `Like (${jumlah})`;

            const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
            semuaLike[judul] = jumlah;
            localStorage.setItem("semuaLike", JSON.stringify(semuaLike));

            await perbaruiLikeKeServer(postId, jumlah);
        }
    });
}

if (formPortofolio) {
    formPortofolio.addEventListener("submit", (e) => {
        e.preventDefault();

        const judul = document.querySelector("#input-judul-porto").value.trim();
        const waktu = document.querySelector("#input-waktu-porto").value.trim();
        const deskripsi = document.querySelector("#input-deskripsi-porto").value.trim();

        if (judul && waktu && deskripsi) {
            renderItemPortofolio({ judul, waktu, deskripsi });
            formPortofolio.reset();
        }
    });
}


async function muatProfilPenulis() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
        if (!response.ok) throw new Error(pesanDariStatus(response.status));
        
        const user = await response.json();
        
        const namaPenulis = document.querySelector("#nama-penulis");
        const emailPenulis = document.querySelector("#email-penulis");

        if (namaPenulis) namaPenulis.textContent = user.name;
        if (emailPenulis) {
            emailPenulis.textContent = user.email;
            emailPenulis.href = `mailto:${user.email}`;
        }
    } catch (error) {
        console.error("Gagal memuat profil penulis:", error.message);
    }
}



async function kirimKomentarKeServer(nama, pesan) {
    const response = await fetch("https://jsonplaceholder.typicode.com/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nama, body: pesan, postId: 1 }),
    });

    if (!response.ok) {
        throw new Error(pesanDariStatus(response.status));
    }

    return await response.json();
}

function renderKomentarKeDOM(id, nama, pesan) {
    const li = document.createElement("li");
    li.dataset.id = id; 
    li.style.marginBottom = "8px";

    const teksKomentar = document.createElement("span");
    teksKomentar.textContent = `${nama}: ${pesan}`;

    const btnHapusKomentar = document.createElement("button");
    btnHapusKomentar.textContent = "Hapus";
    btnHapusKomentar.classList.add("btn-danger");
    btnHapusKomentar.style.marginLeft = "10px";

    li.appendChild(teksKomentar);
    li.appendChild(btnHapusKomentar);
    daftarKomentar.appendChild(li);
}

async function muatKomentarAwal() {
    if (!daftarKomentar) return;
    daftarKomentar.innerHTML = "";

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts/1/comments?_limit=3");
        if (!response.ok) throw new Error(pesanDariStatus(response.status));
        
        const comments = await response.json();
        comments.forEach((c) => {
            renderKomentarKeDOM(c.id, c.name || c.email.split('@')[0], c.body);
        });
    } catch (error) {
        console.error("Gagal memuat komentar awal:", error.message);
    }
}

if (formKomentar) {
    formKomentar.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nama = inputNama.value.trim();
        const pesan = inputPesan.value.trim();

        if (nama === "" || pesan.length < 5) {
            if (pesanError) {
                pesanError.textContent = "Nama wajib diisi dan komentar minimal 5 karakter!";
                pesanError.classList.remove("tersembunyi");
            }
            return;
        }

        if (pesanError) pesanError.classList.add("tersembunyi");

        const btnSubmit = formKomentar.querySelector("button[type='submit']");
        try {
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = "Mengirim...";
            }

            const hasil = await kirimKomentarKeServer(nama, pesan);
            console.log("Komentar tersimpan di server, id:", hasil.id);

            renderKomentarKeDOM(hasil.id, hasil.name, hasil.body);

            sessionStorage.removeItem("drafNama");
            sessionStorage.removeItem("drafPesan");
            formKomentar.reset();
        } catch (error) {
            alert("Gagal mengirim komentar: " + error.message);
            console.error(error);
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Kirim Komentar";
            }
        }
    });
}

if (daftarKomentar) {
    daftarKomentar.addEventListener("click", async (e) => {
        if (e.target.tagName === "BUTTON" && e.target.textContent === "Hapus") {
            const li = e.target.closest("li");
            const id = li.dataset.id;
            const btnHapus = e.target;

            try {
                btnHapus.disabled = true;
                btnHapus.textContent = "Menghapus...";

                const response = await fetch(`https://jsonplaceholder.typicode.com/comments/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error(pesanDariStatus(response.status));
                }

                console.log(`Komentar id #${id} berhasil dihapus dari server.`);
                li.remove();
            } catch (error) {
                alert("Gagal menghapus komentar: " + error.message);
                console.error(error);
            } finally {
                if (btnHapus) {
                    btnHapus.disabled = false;
                    btnHapus.textContent = "Hapus";
                }
            }
        }
    });
}

if (btnHapusSemua && daftarKomentar) {
    btnHapusSemua.addEventListener("click", () => {
        daftarKomentar.innerHTML = "";
    });
}

if (inputNama && inputPesan) {
    inputNama.value = sessionStorage.getItem("drafNama") || "";
    inputPesan.value = sessionStorage.getItem("drafPesan") || "";

    inputNama.addEventListener("input", () => {
        sessionStorage.setItem("drafNama", inputNama.value);
    });

    inputPesan.addEventListener("input", () => {
        sessionStorage.setItem("drafPesan", inputPesan.value);
    });
}


if (btnReset) {
    btnReset.addEventListener("click", () => {
        const konfirmasi = confirm("Hapus semua preferensi tersimpan?");
        if (konfirmasi) {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        }
    });
}

// Jalankan Inisialisasi
muatPreferensiTema();
muatStatusAside();
muatPortofolioDariAPI();
muatProfilPenulis();
muatKomentarAwal();