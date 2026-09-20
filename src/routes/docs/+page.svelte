<script>
	import { ArrowLeft, Cpu, Network, Copy, Check } from 'lucide-svelte';

	let activeDoc = $state('integration'); // 'integration', 'rpi', or 'esp32'
	let payloadCopied = $state(false);

	const jsonPayloadString = `{
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
}`;

	function copyPayload() {
		navigator.clipboard.writeText(jsonPayloadString);
		payloadCopied = true;
		setTimeout(() => {
			payloadCopied = false;
		}, 2000);
	}
</script>

<svelte:head>
	<title>Dokumentasi Teknis — Tomatica</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 pt-6 pb-20">
	<!-- Navbar -->
	<header
		class="sticky top-0 z-40 mx-auto max-w-4xl bg-gray-50/80 px-4 py-4 backdrop-blur-md sm:px-6"
	>
		<div class="flex items-center gap-4">
			<a
				href="/"
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm transition-colors hover:text-red-500"
			>
				<ArrowLeft class="h-5 w-5" />
			</a>
			<div>
				<h1 class="text-xl font-bold text-gray-900">Dokumentasi Teknis</h1>
				<p class="text-xs text-gray-500">Sistem Monitoring Tomatica</p>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-4xl px-4 py-6 sm:px-6">
		<!-- Tabs -->
		<div class="mb-8 flex overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm">
			<button
				onclick={() => (activeDoc = 'integration')}
				class="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 {activeDoc ===
				'integration'
					? 'bg-red-50 text-red-600 shadow-xs'
					: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}"
			>
				<Network class="h-4 w-4" />
				Alur Integrasi
			</button>
			<button
				onclick={() => (activeDoc = 'rpi')}
				class="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 {activeDoc ===
				'rpi'
					? 'bg-red-50 text-red-600 shadow-xs'
					: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}"
			>
				<span class="text-xl" aria-hidden="true">🍓</span>
				Raspberry Pi
			</button>
			<button
				onclick={() => (activeDoc = 'esp32')}
				class="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 {activeDoc ===
				'esp32'
					? 'bg-red-50 text-red-600 shadow-xs'
					: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}"
			>
				<Cpu class="h-4 w-4" />
				Node ESP32
			</button>
		</div>

		<!-- Content -->
		<article
			class="prose prose-sm max-w-none rounded-2xl border border-gray-100 bg-white p-6 shadow-sm prose-red sm:prose-base sm:p-10 prose-headings:font-bold prose-a:text-red-600"
		>
			{#if activeDoc === 'integration'}
			<h2>Integrasi Sistem dan Transmisi Data</h2>
			<p>
				Dokumen ini menjelaskan alur transmisi data dari tingkat hardware (Sensor) hingga
				tampilan <em>real-time</em> pada aplikasi web monitoring. Arsitektur Tomatica
				menggunakan <strong>Supabase</strong> (PostgreSQL) sebagai jembatan data utama antara
				<em>Edge Nodes</em> (Raspberry Pi/ESP32) dan Aplikasi Web.
			</p>

			<h3>1. Topologi Alur Data</h3>
			<p>
				Sistem ini mengikuti alur komunikasi satu arah dari perangkat pengirim ke <em
					>database</em
				>, dan alur event-driven dari <em>database</em> ke aplikasi web.
			</p>
				<p>
					<code
						>Sensor ➔ Python Script (Raspberry Pi) ➔ Supabase (Cloud DB) ➔ SvelteKit Web App</code
					>
				</p>

			<h4>Tahap 1: Pengumpulan Data Lokal</h4>
			<p>
				Python script <code>monitoring_tomat.py</code> pada Raspberry Pi secara berkelanjutan membaca
				data lingkungan fisik:
			</p>
				<ul>
				<li>Menghitung pulsa interupsi dari Anemometer dan Rain Gauge setiap detik.</li>
				<li>Membaca I2C (BH1750, ADS1115) dan 1-Wire (DHT22) di akhir setiap interval.</li>
				<li>
					Semua data mentah dihitung menjadi nilai absolut yang bermakna (contoh: mm/h, lux,
					%).
				</li>
				</ul>

			<h4>Tahap 2: Pengiriman ke Cloud Database</h4>
			<p>
				Di akhir setiap siklus <em>interval</em> (default 60 detik), Python script
				mengkompilasi data menjadi objek JSON. Data ini dikirim ke <em>REST API</em> Supabase
				menggunakan protokol HTTP POST.
			</p>

			<p><strong>Format Payload (JSON):</strong></p>
				<div class="group relative mt-4 mb-6">
					<button
						onclick={copyPayload}
						class="absolute top-3 right-3 rounded-md bg-gray-800 p-1.5 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
					aria-label="Salin payload"
					title="Salin"
					>
						{#if payloadCopied}
							<Check class="h-4 w-4 text-emerald-400" />
						{:else}
							<Copy class="h-4 w-4" />
						{/if}
					</button>
					<pre class="!m-0"><code>{jsonPayloadString}</code></pre>
				</div>
			<p>
				<em
					>Autentikasi HTTP menggunakan JWT Token (Service Role / Anon Key) yang disematkan di
					header request untuk memastikan transmisi yang aman.</em
				>
			</p>

			<h3>2. Bagaimana Aplikasi Web Menerima Data?</h3>
			<p>
				Aplikasi <em>dashboard</em> dibangun menggunakan framework <strong>SvelteKit</strong>
				 yang bekerja secara reaktif. Tidak ada middleware server tambahan; aplikasi
				berkomunikasi langsung secara <em>serverless</em> dengan Supabase.
			</p>

			<h4>A. Pengambilan Data Awal</h4>
				<ul>
				<li>
					Aplikasi mengquery SQL melalui Supabase JS Client untuk meminta 50 baris
					data histori terbaru.
				</li>
				<li>
					Data diproses secara instan menjadi chart (Chart.js) dan daftar tabel. Baris 0
					(paling baru) dikirim ke modul <em>Dashboard</em>.
				</li>
				</ul>

			<h4>B. Sinkronisasi Real-Time (WebSockets)</h4>
			<p>
				Selain melakukan <em>refresh</em>, aplikasi Web membuka saluran komunikasi WebSocket
				menggunakan layanan <code>Supabase Realtime</code>.
			</p>
				<pre><code
						>// Contoh Potongan Kode Integrasi di +page.svelte
supabase
    .channel('realtime-sensor-data')
    .on('postgres_changes', &#123; event: 'INSERT', schema: 'public', table: 'sensor_data' &#125;, (payload) => &#123;
        dataSensor = payload.new;
    &#125;)
    .subscribe();</code
					></pre>
			<p>
				Ketika Raspberry Pi berhasil menyuntikkan baris JSON baru ke tabel, mekanisme
				<em>Postgres Triggers</em> di Supabase segera mengirim <em>broadcast</em> ke WebSocket. Hasil: Kartu pada
				<em>dashboard</em> Anda berkedip hijau, dan angka berubah secara instan tanpa perlu reload
				browser.
			</p>

			<h3>3. Deteksi Perangkat Aktif/Terputus (IsOnline)</h3>
			<p>
				Selain menampilkan data, aplikasi <em>dashboard</em> juga memeriksa aktivitas transmisi:
			</p>
			<ul>
				<li>
					Setiap kali ada <em>event</em> INSERT masuk, aplikasi mencatat
					<strong>timestamp</strong>.
				</li>
				<li>Sistem memiliki timer countdown statis di background (3 menit / 180 detik).</li>
				<li>
					Jika waktu saat ini (<code>Date.now()</code>) melebihi timestamp data terakhir
					sebanyak 3 menit, indikator koneksi berubah menjadi "Disconnected"
					(Merah), dan kartu yang tidak aktif akan menampilkan <code>-</code>.
				</li>
			</ul>
			{:else if activeDoc === 'rpi'}
			<h2>Dokumentasi Raspberry Pi (Tomatica)</h2>
			<p>
				Dokumen ini menjelaskan pengoperasian, konfigurasi, dan penggunaan Python script <code
					>monitoring_tomat.py</code
				> yang berjalan di Raspberry Pi.
			</p>

			<h3>1. Pendahuluan</h3>
			<p>
				Script <code>monitoring_tomat.py</code> dirancang untuk mengubah Raspberry Pi menjadi
				<strong>Edge Gateway</strong>
				dan pembaca sensor. Berbeda dengan ESP32 yang menggunakan Arduino, Raspberry Pi
				membaca sensor menggunakan protokol I2C dan GPIO secara langsung, lalu mencatat data
				secara lokal dan mengirimnya ke database <em>cloud</em> (Supabase).
			</p>

			<h3>2. Daftar Sensor dan Pemetaan Pin</h3>
			<ul>
				<li><strong>Rain Sensor:</strong> Terhubung ke GPIO 23 (BCM).</li>
				<li><strong>Anemometer (Kecepatan Angin):</strong> Terhubung ke GPIO 24 (BCM).</li>
				<li><strong>BH1750 (via I2C):</strong> Membaca intensitas cahaya (Lux).</li>
				<li>
					<strong>Soil Moisture Analog (via ADS1115):</strong> Dibaca melalui ADC ADS1115 (Pin A0) pada
					bus I2C.
				</li>
				<li><strong>DHT22 (1-Wire):</strong> Terhubung ke pin GPIO 4 (Board D4).</li>
			</ul>

			<h3>3. Konfigurasi Script</h3>
			<ul>
				<li>
					<strong><code>INTERVAL</code></strong>: Interval pembacaan dan pengiriman data (dalam
					detik). Disarankan: 60 detik.
				</li>
				<li>
					<strong><code>RAIN_MM_PER_TICK</code></strong>: Konstanta kalibrasi curah hujan per
					tip (0.279 mm).
				</li>
				<li>
					<strong><code>WIND_FACTOR</code></strong>: Faktor kalibrasi kecepatan angin (2.4).
				</li>
				<li><strong><code>CSV_FILE</code></strong>: Nama file backup lokal.</li>
				<li><strong>Supabase Config</strong>: Berisi URL dan Key untuk autentikasi.</li>
			</ul>

			<h3>4. Alur Kerja Program</h3>
			<ol>
				<li>
					<strong>Inisialisasi:</strong> Menyiapkan library, mengkonfigurasi BCM GPIO, dan memulai komunikasi I2C
					dan 1-Wire.
				</li>
				<li><strong>Pembuatan File CSV:</strong> Membuat baris header jika belum ada.</li>
				<li>
					<strong>Loop Monitoring:</strong>
					<ul>
						<li>Menghitung pulsa sensor hujan dan angin selama durasi interval.</li>
						<li>
							Setelah interval berlalu, script membaca suhu, kelembaban, cahaya, dan nilai tanah.
						</li>
						<li>Menyimpan ke CSV lokal sebagai backup.</li>
						<li>Mengirim data <em>JSON payload</em> ke Supabase melalui fungsi HTTP POST.</li>
					</ul>
				</li>
			</ol>

			<h3>5. Cara Menjalankan</h3>
			<pre><code>python3 monitoring_tomat.py</code></pre>
			<p>
				Program akan menampilkan log pembacaan sensor dan status transmisinya ke Supabase.
				Disarankan untuk menggunakan <em>background service</em> seperti <code>systemd</code>.
			</p>
			{:else}
			<h2>Dokumentasi ESP32 (Tomatica)</h2>
			<p>
				Dokumen ini menjelaskan pengoperasian, konfigurasi, dan penggunaan kode firmware <code
					>tomatica.ino</code
				> pada mikrokontroler ESP32.
			</p>

			<h3>1. Pendahuluan</h3>
			<p>
				Kode <code>tomatica.ino</code> dirancang untuk mengubah ESP32 menjadi
				<strong>Sensor Node</strong>
				yang bertanggung jawab untuk membaca berbagai sensor lingkungan dan tanah secara langsung. Data yang dibaca
				kemudian ditampilkan melalui <em>Serial Monitor</em> dan perangkat mendukung pembaruan program
				over-the-air (OTA).
			</p>

			<h3>2. Daftar Sensor yang Digunakan</h3>
			<ul>
				<li>
					<strong>Soil NPK 7-in-1 (Modbus RS485):</strong> Membaca kelembaban tanah, pH, N, P, dan
					K. Terhubung melalui <code>Serial2</code>.
				</li>
				<li><strong>AHT21 (I2C):</strong> Membaca suhu udara dan kelembaban.</li>
				<li><strong>ENS160 (I2C):</strong> Membaca kualitas udara (AQI), TVOC, dan eCO2.</li>
				<li><strong>BH1750 (I2C):</strong> Membaca intensitas cahaya.</li>
				<li><strong>DHT22 (1-Wire):</strong> Sensor cadangan suhu dan kelembaban.</li>
				<li><strong>Rain Sensor (Interrupt):</strong> Menghitung curah hujan.</li>
				<li><strong>Anemometer (Interrupt):</strong> Mengukur kecepatan angin.</li>
			</ul>

			<h3>3. Pemetaan Pin (Pinout)</h3>
			<ul>
				<li>
					<strong>Modul RS485 (Serial2):</strong> <code>RX = 16</code>, <code>TX = 17</code>
				</li>
				<li><strong>Serial1 (Cadangan):</strong> <code>RX = 4</code>, <code>TX = 5</code></li>
				<li><strong>Rain Sensor:</strong> <code>Pin 13</code> (Interrupt - FALLING)</li>
				<li><strong>Wind Sensor:</strong> <code>Pin 32</code> (Interrupt - RISING)</li>
				<li><strong>Sensor DHT22:</strong> <code>Pin 15</code></li>
				<li><strong>Bus I2C:</strong> <code>SDA = 21</code>, <code>SCL = 22</code></li>
			</ul>

			<h3>4. Konfigurasi Jaringan (WiFi & OTA)</h3>
			<p>
				ESP32 akan mencoba terhubung ke jaringan <strong>Windstand</strong>. Jika berhasil, fitur
				<strong>ArduinoOTA</strong> menjadi aktif dengan nama <em>ESP32-Weather-Station-Pro</em>. Ini memungkinkan Anda mengunggah
				program (.bin) melalui WiFi tanpa kabel USB.
			</p>

			<h3>5. Alur Kerja Program</h3>
			<ol>
				<li>
					<strong>Setup Awal:</strong> Menginisialisasi Serial, I2C, sensor, pin interupsi, dan terhubung
					ke WiFi.
				</li>
				<li>
					<strong>Main Loop:</strong>
					<ul>
						<li>Memeriksa permintaan OTA.</li>
						<li>Menjalankan pembacaan dan pencetakan data setiap 5 detik.</li>
					</ul>
				</li>
				<li>
					<strong>Pembacaan Sensor:</strong> Membaca data I2C, 1-Wire, dan RS485, lalu menghitung kecepatan angin
					dan curah hujan (yang direset per jam/hari).
				</li>
				<li>
					<strong>Pencetakan Data:</strong> Menampilkan hasil pembacaan ke Serial Monitor dengan baud
					rate 115200.
				</li>
			</ol>

			<h3>6. Library yang Dibutuhkan</h3>
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
