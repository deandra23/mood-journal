// 1. INITIALIZE SUPABASE
const SUPABASE_URL = 'https://qmziungyadenrwagcbxd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_XfFbT2rOqGmFq9Ty8AjDhQ_9L_YvQXq';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let selectedMood = '';
let isPrivate = false;

// 2. AUTHENTICATION (MFA via OTP)
async function handleLogin() {
    const email = document.getElementById('email').value;
    const { error } = await supabase.auth.signInWithOtp({ email });
    
    if (error) return alert(error.message);
    alert("OTP sent to your email!");
    document.getElementById('otp-input').classList.remove('hidden');
    document.getElementById('login-btn').classList.add('hidden');
}

async function verifyOtp() {
    const email = document.getElementById('email').value;
    const token = document.getElementById('otp-code').value;
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'magiclink'});

    if (error) return alert("Invalid Code");
    checkUser();
}

// 3. MOOD LOGIC
function selectMood(emoji, label) {
    selectedMood = emoji;
    alert(`Selected: ${label}`);
}

async function saveMood() {
    const note = document.getElementById('note').value;
    const { data: { user } } = await supabase.auth.getUser();

    if (!selectedMood) return alert("Please select a mood first!");

    const { error } = await supabase.from('mood_entries').insert([
        { user_id: user.id, mood_type: selectedMood, note: note }
    ]);

    if (error) alert("Error saving data");
    else {
        alert("Entry secured!");
        document.getElementById('note').value = '';
        fetchHistory();
    }
}

// 4. DATA RETRIEVAL
async function fetchHistory() {
    const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .order('created_at', { ascending: false });

    const list = document.getElementById('history-list');
    list.innerHTML = data.map(entry => `
        <div class="bg-white/60 p-4 rounded-2xl shadow-sm border border-white">
            <div class="flex justify-between items-center">
                <span class="text-2xl">${entry.mood_type}</span>
                <span class="text-xs text-gray-400">${new Date(entry.created_at).toLocaleDateString()}</span>
            </div>
            <p class="mt-2 text-gray-700 ${isPrivate ? 'blur-md select-none' : ''}">${entry.note || 'No notes'}</p>
        </div>
    `).join('');
}

// 5. UTILITIES
function toggleSafety() {
    document.getElementById('safety-modal').classList.toggle('hidden');
}

function togglePrivacy() {
    isPrivate = !isPrivate;
    document.getElementById('privacy-btn').innerText = `Hide Content: ${isPrivate ? 'ON' : 'OFF'}`;
    fetchHistory();
}

// Initial check to see if logged in
async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        document.getElementById('user-display').innerText = session.user.email;
        fetchHistory();
    }
}
checkUser();
