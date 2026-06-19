<script>
	import { ArrowLeft, Cpu, Network } from 'lucide-svelte';

	let activeDoc = $state('integration'); // 'integration', 'rpi', or 'esp32'
</script>

<svelte:head>
	<title>Dokumentasi Teknis — Tomatica</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-20 pt-6">
	<!-- Navbar -->
	<header class="sticky top-0 z-40 mx-auto max-w-4xl bg-gray-50/80 px-4 py-4 backdrop-blur-md sm:px-6">
		<div class="flex items-center gap-4">
			<a
				href="/"
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm transition-colors hover:text-red-500"
			>
				<ArrowLeft class="h-5 w-5" />
			</a>
			<div>
				<h1 class="text-xl font-bold text-gray-900">Dokumentasi Teknis</h1>
				<p class="text-xs text-gray-500">Tomatica Monitoring System</p>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-4xl px-4 py-6 sm:px-6">
		<!-- Tabs -->
		<div class="mb-8 flex rounded-2xl bg-white p-1.5 shadow-sm overflow-x-auto">
			<button
				onclick={() => (activeDoc = 'integration')}
				class="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 {activeDoc === 'integration'
					? 'bg-red-50 text-red-600 shadow-xs'
					: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}"
			>
				<Network class="h-4 w-4" />
				Alur Integrasi
			</button>
			<button
				onclick={() => (activeDoc = 'rpi')}
				class="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 {activeDoc === 'rpi'
					? 'bg-red-50 text-red-600 shadow-xs'
					: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}"
			>
				<span class="text-xl" aria-hidden="true">🍓</span>
				Raspberry Pi
			</button>
			<button
				onclick={() => (activeDoc = 'esp32')}
				class="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 {activeDoc === 'esp32'
					? 'bg-red-50 text-red-600 shadow-xs'
					: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}"
			>
				<Cpu class="h-4 w-4" />
				ESP32 Node
			</button>
		</div>

		<!-- Content -->
		<article class="prose prose-red prose-sm sm:prose-base prose-headings:font-bold prose-a:text-red-600 max-w-none rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
			{#if activeDoc === 'integration'}
				<h2>Integrasi Sistem dan Transmisi Data</h2>
				<p>
					Dokumen ini menjelaskan alur transmisi data dari tingkat perangkat keras (Sensor) hingga tertampil secara <em>real-time</em> di aplikasi web pemantauan. Arsitektur Tomatica menggunakan <strong>Supabase</strong> (PostgreSQL) sebagai jembatan data utama antara <em>Edge Node</em> (Raspberry Pi/ESP32) dan Aplikasi Web.
				</p>

				<h3>1. Topologi Alur Data (Data Flow)</h3>
				<p>
					Sistem ini mengikuti alur komunikasi satu arah dari perangkat pengirim menuju <em>database</em>, dan <em>event-driven</em> dari <em>database</em> menuju aplikasi web.
				</p>
				<p><code>Sensor ➔ Python Script (Raspberry Pi) ➔ Supabase (Cloud DB) ➔ SvelteKit Web App</code></p>

				<h4>Tahap 1: Pengumpulan Data Lokal</h4>
				<p>Skrip Python <code>monitoring_tomat.py</code> pada Raspberry Pi secara terus-menerus membaca data fisik lingkungan:</p>
				<ul>
					<li>Menghitung interrupt pulsa dari Anemometer dan Rain Gauge setiap detik.</li>
					<li>Membaca I2C (BH1750, ADS1115) dan 1-Wire (DHT22) pada akhir interval.</li>
					<li>Seluruh data mentah dikalkulasi menjadi nilai absolut yang bermakna (misal: mm/h, lux, %).</li>
				</ul>

				<h4>Tahap 2: Pengiriman ke Cloud Database</h4>
				<p>Pada setiap akhir siklus <em>interval</em> (standarnya 60 detik), skrip Python akan menyatukan data menjadi objek JSON. Data ini dikirimkan menuju <em>REST API</em> milik Supabase menggunakan protokol HTTP POST.</p>
				
				<p><strong>Format Payload (JSON):</strong></p>
				<pre><code>&#123;
    "air_temperature": 27.5,
    "air_humidity": 75.2,
    "lux": 15200.0,
    "soil_moisture": 68.0,
    "rainfall": 0.0,
    "wind_speed": 1.2,
    "soil_ph": 6.5,
    "nitrogen": 45,
    "phosphorus": 20,
    "potassium": 30,
    "co2": 410,
    "aqi": 42
&#125;</code></pre>
				<p><em>Autentikasi HTTP menggunakan JWT Token (Service Role / Anon Key) disematkan dalam header permintaan untuk menjamin keamanan pengiriman.</em></p>

				<h3>2. Bagaimana Aplikasi Web Menerima Data?</h3>
				<p>Aplikasi <em>dashboard</em> dibangun menggunakan kerangka kerja <strong>SvelteKit</strong> yang bekerja secara sangat reaktif. Tidak ada server perantara tambahan, aplikasi ini berkomunikasi langsung secara <em>serverless</em> dengan Supabase.</p>

				<h4>A. Pengambilan Data Awal (Initial Fetch)</h4>
				<ul>
					<li>Aplikasi melakukan kueri SQL melalui Supabase JS Client untuk meminta 50 baris riwayat data terakhir.</li>
					<li>Data tersebut diolah seketika menjadi grafik (Chart.js) dan daftar tabel. Baris ke-0 (terbaru) dikirimkan ke modul <em>Dashboard</em>.</li>
				</ul>

				<h4>B. Sinkronisasi Real-Time (WebSockets)</h4>
				<p>Alih-alih melakukan <em>refresh</em>, aplikasi Web membuka jalur komunikasi WebSocket menggunakan layanan <code>Supabase Realtime</code>.</p>
				<pre><code>// Contoh Cuplikan Kode Integrasi di +page.svelte
supabase
    .channel('realtime-sensor-data')
    .on('postgres_changes', &#123; event: 'INSERT', schema: 'public', table: 'sensor_data' &#125;, (payload) => &#123;
        dataSensor = payload.new;
    &#125;)
    .subscribe();</code></pre>
				<p>Ketika Raspberry Pi berhasil menyuntikkan baris JSON baru ke tabel, mekanisme <em>Postgres Triggers</em> di Supabase langsung mengirimkan <em>broadcast</em> ke WebSocket. Hasilnya: Kartu di <em>dashboard</em> Anda berkedip hijau, dan angka seketika berubah tanpa perlu memuat ulang peramban.</p>

				<h3>3. Deteksi Perangkat Aktif/Terputus (IsOnline)</h3>
				<p>Selain menampilkan data, aplikasi <em>dashboard</em> juga memeriksa aktivitas pengiriman:</p>
				<ul>
					<li>Setiap kali <em>event</em> INSERT masuk, aplikasi mencatat <strong>stempel waktu (timestamp)</strong>.</li>
					<li>Sistem memiliki penghitung mundur statis di latar belakang (3 menit / 180 detik).</li>
					<li>Jika waktu saat ini (<code>Date.now()</code>) melampaui stempel waktu masuknya data terakhir sejauh 3 menit, maka indikator konektivitas akan berubah menjadi "Terputus" (Merah), dan kartu yang tidak aktif akan menampilkan <code>-</code>.</li>
				</ul>

			{:else if activeDoc === 'rpi'}
				<h2>Dokumentasi Raspberry Pi (Tomatica)</h2>
				<p>Dokumen ini menjelaskan cara kerja, konfigurasi, dan penggunaan skrip Python <code>monitoring_tomat.py</code> yang dijalankan pada Raspberry Pi.</p>

				<h3>1. Pendahuluan</h3>
				<p>Skrip <code>monitoring_tomat.py</code> dirancang untuk menjadikan Raspberry Pi sebagai <strong>Edge Gateway</strong> sekaligus pembaca sensor. Berbeda dengan ESP32 yang menggunakan Arduino, Raspberry Pi membaca sensor menggunakan protokol I2C dan GPIO secara langsung, lalu mencatatnya secara lokal dan mengirimkannya ke database <em>cloud</em> (Supabase).</p>

				<h3>2. Daftar Sensor dan Pemetaan Pin</h3>
				<ul>
					<li><strong>Sensor Hujan:</strong> Terhubung ke GPIO 23 (BCM).</li>
					<li><strong>Anemometer (Kecepatan Angin):</strong> Terhubung ke GPIO 24 (BCM).</li>
					<li><strong>BH1750 (Via I2C):</strong> Membaca intensitas cahaya (Lux).</li>
					<li><strong>Soil Moisture Analog (Via ADS1115):</strong> Dibaca melalui ADC ADS1115 (Pin A0) pada jalur I2C.</li>
					<li><strong>DHT22 (1-Wire):</strong> Terhubung ke pin GPIO 4 (Board D4).</li>
				</ul>

				<h3>3. Konfigurasi Skrip</h3>
				<ul>
					<li><strong><code>INTERVAL</code></strong>: Jeda pembacaan dan pengiriman data (dalam detik). Disarankan 60 detik.</li>
					<li><strong><code>RAIN_MM_PER_TICK</code></strong>: Konstanta kalibrasi curah hujan per jungkitan (0.279 mm).</li>
					<li><strong><code>WIND_FACTOR</code></strong>: Faktor kalibrasi kecepatan angin (2.4).</li>
					<li><strong><code>CSV_FILE</code></strong>: Nama file backup lokal.</li>
					<li><strong>Supabase Config</strong>: Berisi URL dan Key untuk otentikasi.</li>
				</ul>

				<h3>4. Alur Kerja Program (Cara Kerja)</h3>
				<ol>
					<li><strong>Inisialisasi:</strong> Menyiapkan library, mengatur GPIO BCM, serta memulai komunikasi I2C dan 1-Wire.</li>
					<li><strong>Pembuatan File CSV:</strong> Membuat baris judul jika belum ada.</li>
					<li><strong>Looping Monitoring:</strong>
						<ul>
							<li>Menghitung pulsa sensor hujan dan angin selama durasi interval.</li>
							<li>Setelah interval berlalu, skrip membaca nilai suhu, kelembaban, cahaya, dan tanah.</li>
							<li>Menyimpan ke CSV lokal sebagai cadangan.</li>
							<li>Mengirim data <em>payload JSON</em> ke Supabase melalui fungsi HTTP POST.</li>
						</ul>
					</li>
				</ol>

				<h3>5. Cara Menjalankan</h3>
				<pre><code>python3 monitoring_tomat.py</code></pre>
				<p>Program akan menampilkan log pembacaan sensor dan status pengirimannya ke Supabase. Disarankan menggunakan <em>background service</em> seperti <code>systemd</code>.</p>

			{:else}
				<h2>Dokumentasi ESP32 (Tomatica)</h2>
				<p>Dokumen ini menjelaskan cara kerja, konfigurasi, dan penggunaan kode firmware <code>tomatica.ino</code> pada mikrokontroler ESP32.</p>

				<h3>1. Pendahuluan</h3>
				<p>Kode <code>tomatica.ino</code> dirancang untuk menjadikan ESP32 sebagai <strong>Sensor Node</strong> yang bertugas membaca berbagai sensor lingkungan dan tanah secara langsung. Data yang dibaca kemudian ditampilkan melalui <em>Serial Monitor</em> dan perangkat mendukung pembaruan program tanpa kabel (Over-The-Air / OTA).</p>

				<h3>2. Daftar Sensor yang Digunakan</h3>
				<ul>
					<li><strong>Soil NPK 7-in-1 (Modbus RS485):</strong> Membaca kelembaban tanah, pH, N, P, dan K. Terhubung via <code>Serial2</code>.</li>
					<li><strong>AHT21 (I2C):</strong> Membaca suhu dan kelembaban udara.</li>
					<li><strong>ENS160 (I2C):</strong> Membaca kualitas udara (AQI), TVOC, dan eCO2.</li>
					<li><strong>BH1750 (I2C):</strong> Membaca intensitas cahaya.</li>
					<li><strong>DHT22 (1-Wire):</strong> Sensor cadangan suhu dan kelembaban.</li>
					<li><strong>Sensor Hujan (Interrupt):</strong> Menghitung curah hujan.</li>
					<li><strong>Anemometer (Interrupt):</strong> Mengukur kecepatan angin.</li>
				</ul>

				<h3>3. Pemetaan Pin (Pinout)</h3>
				<ul>
					<li><strong>Modul RS485 (Serial2):</strong> <code>RX = 16</code>, <code>TX = 17</code></li>
					<li><strong>Serial1 (Cadangan):</strong> <code>RX = 4</code>, <code>TX = 5</code></li>
					<li><strong>Sensor Hujan:</strong> <code>Pin 13</code> (Interrupt - FALLING)</li>
					<li><strong>Sensor Angin:</strong> <code>Pin 32</code> (Interrupt - RISING)</li>
					<li><strong>Sensor DHT22:</strong> <code>Pin 15</code></li>
					<li><strong>Jalur I2C:</strong> <code>SDA = 21</code>, <code>SCL = 22</code></li>
				</ul>

				<h3>4. Konfigurasi Jaringan (WiFi & OTA)</h3>
				<p>ESP32 akan mencoba terhubung ke jaringan <strong>Windstand</strong>. Jika berhasil, fitur <strong>ArduinoOTA</strong> aktif dengan nama <em>ESP32-Weather-Station-Pro</em>. Ini memungkinkan Anda mengunggah program (.bin) via WiFi tanpa kabel USB.</p>

				<h3>5. Alur Kerja Program (Cara Kerja)</h3>
				<ol>
					<li><strong>Setup Awal:</strong> Inisialisasi Serial, I2C, sensor, pin interrupt, dan menyambung ke WiFi.</li>
					<li><strong>Looping Utama:</strong>
						<ul>
							<li>Memeriksa permintaan OTA.</li>
							<li>Menjalankan pembacaan dan pencetakan data setiap 5 detik.</li>
						</ul>
					</li>
					<li><strong>Pembacaan Sensor:</strong> Membaca data I2C, 1-Wire, dan RS485, lalu menghitung kecepatan angin dan curah hujan (yang direset per jam/hari).</li>
					<li><strong>Pencetakan Data:</strong> Menampilkan hasil pembacaan ke Serial Monitor pada baud rate 115200.</li>
				</ol>

				<h3>6. Library yang Diperlukan</h3>
				<ul>
					<li><code>DHT sensor library</code></li>
					<li><code>Adafruit AHTX0</code></li>
					<li><code>DFRobot_ENS160</code></li>
					<li><code>BH1750</code></li>
				</ul>
			{/if}
		</article>
	</main>
</div>
