

// REPLACE THESE with your actual Supabase Project details
const supabaseUrl = 'https://qmziungyadenrwagcbxd.supabase.co';
const supabaseKey = 'sb_publishable_XfFbT2rOqGmFq9Ty8AjDhQ_9L_YvQXq';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// UI DOM Elements
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginBtn = document.getElementById('login-btn');
const moodBtns = document.querySelectorAll('.mood-btn');
const saveBtn = document.getElementById('save-btn');
const entriesList = document.getElementById('entries-list');

let selectedMood = "";

// 1. Auth State Management
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        authScreen.style.opacity = '0';
        setTimeout(() => {
            authScreen.style.display = 'none';
            appScreen.style.display = 'block';
            loadEntries();
        }, 400);
    } else {
        authScreen.style.display = 'flex';
        appScreen.style.display = 'none';
    }
});

// 2. Magic Link MFA Login
loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email-input').value;
    const status = document.getElementById('auth-status');
    status.innerText = "Sending link... ✨";
    
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) status.innerText = "Error: " + error.message;
    else status.innerText = "Check your email for your login link!";
});

// 3. Mood Selection logic
moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMood = btn.dataset.mood;
        
        // Pulse animation
        btn.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.2)' },
            { transform: 'scale(1)' }
        ], { duration: 400, easing: 'ease-out' });
    });
});

// 4. Save Entry to Cloud
saveBtn.addEventListener('click', async () => {
    const content = document.getElementById('journal-entry').value;
    if (!selectedMood || !content) return alert("Please pick a mood and share your thoughts! ✨");

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('entries').insert([
        { mood: selectedMood, content, user_id: user.id }
    ]);

    if (!error) {
        document.getElementById('journal-entry').value = "";
        selectedMood = "";
        moodBtns.forEach(b => b.classList.remove('selected'));
        
        // Success animation on button
        saveBtn.innerText = "Saved! ✨";
        setTimeout(() => saveBtn.innerText = "Bloom & Save", 2000);
        
        loadEntries();
    }
});

// 5. Fetch Entries from Cloud
async function loadEntries() {
    const { data } = await supabase.from('entries').select('*').order('created_at', { ascending: false });
    if (data) {
        entriesList.innerHTML = data.map((e, i) => `
            <div class="entry-card" style="animation-delay: ${i * 0.1}s">
                <div style="display:flex; justify-content:space-between;">
                    <span style="font-size:1.5rem;">${getEmoji(e.mood)}</span>
                    <small style="color:#aaa;">${new Date(e.created_at).toLocaleDateString()}</small>
                </div>
                <p style="margin: 10px 0 0 0; line-height: 1.5;">${e.content}</p>
            </div>
        `).join('');
    }
}

function getEmoji(mood) {
    const map = { Radiant: "🌈", Peaceful: "🍃", Balanced: "⚖️", Low: "☁️", Overwhelmed: "🌊" };
    return map[mood] || "✨";
}

// 6. Logout
document.getElementById('logout-btn').addEventListener('click', () => supabase.auth.signOut());
