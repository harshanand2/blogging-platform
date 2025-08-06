// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// State Management
let currentUser = null;
let currentPage = 'home';
let posts = [];

// DOM Elements
const elements = {};

// Initialize DOM Elements with error handling
function initializeElements() {
    const elementIds = [
        'navMenu', 'navToggle', 'authButtons', 'userMenu', 'username', 'logoutBtn',
        'homePage', 'createPage', 'postDetailPage',
        'authModal', 'modalTitle', 'authForm', 'authEmail', 'authUsername', 
        'usernameGroup', 'authPassword', 'authButtonText', 'authSwitchText', 
        'authSwitchBtn', 'closeModal',
        'postsGrid', 'loadingSpinner', 'sortSelect',
        'createPostForm', 'postTitle', 'postContent', 'cancelPostBtn',
        'postDetail', 'toastContainer',
        'loginBtn', 'registerBtn', 'startWritingBtn'
    ];

    elementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            elements[id] = element;
        } else {
            console.error(`Element with id '${id}' not found`);
        }
    });

    // Log which elements were found
    console.log('Found elements:', Object.keys(elements));
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    initializeElements();
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
    loadPosts();
});

// Initialize App
function initializeApp() {
    // Check for stored token
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        updateUIForAuthenticatedUser();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateToPage(page);
        });
    });

    // Mobile menu toggle
    if (elements.navToggle) {
        elements.navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Auth buttons
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', () => showAuthModal('login'));
    }
    if (elements.registerBtn) {
        elements.registerBtn.addEventListener('click', () => showAuthModal('register'));
    }
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }
    if (elements.startWritingBtn) {
        elements.startWritingBtn.addEventListener('click', () => navigateToPage('create'));
    }

    // Auth modal
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', hideAuthModal);
    }
    if (elements.authSwitchBtn) {
        elements.authSwitchBtn.addEventListener('click', toggleAuthMode);
    }
    if (elements.authForm) {
        elements.authForm.addEventListener('submit', handleAuthSubmit);
    }

    // Create post
    if (elements.createPostForm) {
        elements.createPostForm.addEventListener('submit', handleCreatePost);
    }
    if (elements.cancelPostBtn) {
        elements.cancelPostBtn.addEventListener('click', () => navigateToPage('home'));
    }

    // Sort posts
    if (elements.sortSelect) {
        elements.sortSelect.addEventListener('change', handleSortChange);
    }

    // Close modal on outside click
    if (elements.authModal) {
        elements.authModal.addEventListener('click', (e) => {
            if (e.target === elements.authModal) {
                hideAuthModal();
            }
        });
    }
    
    console.log('Event listeners setup complete');
}

// Navigation
function navigateToPage(page) {
    console.log('Navigating to page:', page);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('Page shown:', page + 'Page');
    } else {
        console.error('Target page not found:', page + 'Page');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    currentPage = page;
    
    // Load page-specific content
    if (page === 'home') {
        loadPosts();
    }
}

// Mobile Menu
function toggleMobileMenu() {
    elements.navMenu.classList.toggle('active');
}

// Authentication
function showAuthModal(mode) {
    console.log('Showing auth modal:', mode);
    if (elements.authModal) {
        elements.authModal.classList.add('active');
        setAuthMode(mode);
    } else {
        console.error('Auth modal element not found');
    }
}

function hideAuthModal() {
    elements.authModal.classList.remove('active');
    elements.authForm.reset();
}

function setAuthMode(mode) {
    if (mode === 'login') {
        elements.modalTitle.textContent = 'Login';
        elements.authButtonText.textContent = 'Login';
        elements.authSwitchText.textContent = "Don't have an account?";
        elements.authSwitchBtn.textContent = 'Sign Up';
        elements.usernameGroup.style.display = 'none';
        elements.authUsername.required = false;
    } else {
        elements.modalTitle.textContent = 'Sign Up';
        elements.authButtonText.textContent = 'Sign Up';
        elements.authSwitchText.textContent = 'Already have an account?';
        elements.authSwitchBtn.textContent = 'Login';
        elements.usernameGroup.style.display = 'block';
        elements.authUsername.required = true;
    }
}

function toggleAuthMode() {
    const currentMode = elements.modalTitle.textContent.toLowerCase().includes('login') ? 'login' : 'register';
    const newMode = currentMode === 'login' ? 'register' : 'login';
    setAuthMode(newMode);
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    if (elements.modalTitle.textContent.includes('Sign Up')) {
        data.username = formData.get('username');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/${elements.modalTitle.textContent.includes('Sign Up') ? 'register' : 'login'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            if (elements.modalTitle.textContent.includes('Sign Up')) {
                showToast('Account created successfully!', 'success');
                setAuthMode('login');
            } else {
                // Login successful
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                currentUser = result.user;
                updateUIForAuthenticatedUser();
                hideAuthModal();
                showToast('Login successful!', 'success');
                loadPosts();
            }
        } else {
            showToast(result.message || 'Authentication failed', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

function updateUIForAuthenticatedUser() {
    elements.authButtons.style.display = 'none';
    elements.userMenu.style.display = 'flex';
    elements.username.textContent = currentUser.username;
}

function updateUIForUnauthenticatedUser() {
    elements.authButtons.style.display = 'flex';
    elements.userMenu.style.display = 'none';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateUIForUnauthenticatedUser();
    showToast('Logged out successfully', 'info');
    navigateToPage('home');
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        updateUIForAuthenticatedUser();
    } else {
        updateUIForUnauthenticatedUser();
    }
}

// Posts Management
async function loadPosts() {
    console.log('Loading posts...');
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/blogs`);
        const data = await response.json();
        
        if (response.ok) {
            posts = data;
            console.log('Posts loaded:', posts.length);
            renderPosts();
        } else {
            console.error('Failed to load posts:', data);
            showToast('Failed to load posts', 'error');
        }
    } catch (error) {
        console.error('Network error loading posts:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function renderPosts() {
    console.log('Rendering posts, count:', posts.length);
    const sortedPosts = [...posts];
    const sortBy = elements.sortSelect?.value || 'latest';
    
    if (sortBy === 'popular') {
        sortedPosts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else {
        sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    if (elements.postsGrid) {
        elements.postsGrid.innerHTML = sortedPosts.map(post => `
        <div class="post-card" onclick="viewPost('${post._id}')">
            <div class="post-card-header">
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    <div class="post-author">
                        <i class="fas fa-user"></i>
                        <span>${escapeHtml(post.author?.username || 'Unknown')}</span>
                    </div>
                    <span>${formatDate(post.createdAt)}</span>
                </div>
            </div>
            <div class="post-card-body">
                <p class="post-excerpt">${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</p>
            </div>
            <div class="post-actions">
                <div class="post-stats">
                    <div class="post-stat ${isPostLiked(post) ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike('${post._id}')">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes?.length || 0}</span>
                    </div>
                    <div class="post-stat">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments?.length || 0}</span>
                    </div>
                </div>
                ${currentUser && post.author?._id === currentUser.id ? 
                    `<button class="btn btn-outline" onclick="event.stopPropagation(); deletePost('${post._id}')">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
    } else {
        console.error('Posts grid element not found');
    }
}

async function viewPost(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/blogs/${postId}`);
        const post = await response.json();
        
        if (response.ok) {
            renderPostDetail(post);
            navigateToPage('postDetail');
        } else {
            showToast('Post not found', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

function renderPostDetail(post) {
    elements.postDetail.innerHTML = `
        <div class="post-detail-header">
            <h1 class="post-detail-title">${escapeHtml(post.title)}</h1>
            <div class="post-detail-meta">
                <div class="post-author">
                    <i class="fas fa-user"></i>
                    <span>${escapeHtml(post.author?.username || 'Unknown')}</span>
                </div>
                <span>${formatDate(post.createdAt)}</span>
            </div>
        </div>
        
        <div class="post-detail-content">
            ${escapeHtml(post.content).replace(/\n/g, '<br>')}
        </div>
        
        <div class="post-detail-actions">
            <button class="btn btn-outline ${isPostLiked(post) ? 'liked' : ''}" onclick="toggleLike('${post._id}')">
                <i class="fas fa-heart"></i>
                <span>${post.likes?.length || 0} Likes</span>
            </button>
            ${currentUser && post.author?._id === currentUser.id ? 
                `<button class="btn btn-outline" onclick="deletePost('${post._id}')">Delete Post</button>` : ''}
        </div>
        
        <div class="post-detail-stats">
            <div class="post-stat">
                <i class="fas fa-heart"></i>
                <span>${post.likes?.length || 0} Likes</span>
            </div>
            <div class="post-stat">
                <i class="fas fa-comment"></i>
                <span>${post.comments?.length || 0} Comments</span>
            </div>
        </div>
        
        <div class="comments-section">
            <h3>Comments</h3>
            ${currentUser ? `
                <div class="comment-form">
                    <textarea class="comment-input" id="commentInput" placeholder="Write a comment..."></textarea>
                    <button class="btn btn-primary" onclick="addComment('${post._id}')">Add Comment</button>
                </div>
            ` : '<p>Please login to comment</p>'}
            
            <div class="comments-list">
                ${post.comments?.map(comment => `
                    <div class="comment">
                        <div class="comment-header">
                            <span class="comment-author">${escapeHtml(comment.user?.username || 'Unknown')}</span>
                            <span class="comment-date">${formatDate(comment.createdAt)}</span>
                        </div>
                        <div class="comment-text">${escapeHtml(comment.text)}</div>
                    </div>
                `).join('') || '<p>No comments yet</p>'}
            </div>
        </div>
    `;
}

async function handleCreatePost(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showToast('Please login to create a post', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const data = {
        title: formData.get('title'),
        content: formData.get('content')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('Post created successfully!', 'success');
            e.target.reset();
            navigateToPage('home');
            loadPosts();
        } else {
            showToast(result.message || 'Failed to create post', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

async function toggleLike(postId) {
    if (!currentUser) {
        showToast('Please login to like posts', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/blogs/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            loadPosts();
            if (currentPage === 'postDetail') {
                const post = posts.find(p => p._id === postId);
                if (post) viewPost(postId);
            }
        } else {
            showToast('Failed to like post', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

async function addComment(postId) {
    const commentInput = document.getElementById('commentInput');
    const comment = commentInput.value.trim();
    
    if (!comment) {
        showToast('Please enter a comment', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/blogs/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ text: comment })
        });
        
        if (response.ok) {
            commentInput.value = '';
            viewPost(postId);
            showToast('Comment added successfully!', 'success');
        } else {
            showToast('Failed to add comment', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/blogs/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            showToast('Post deleted successfully!', 'success');
            if (currentPage === 'postDetail') {
                navigateToPage('home');
            }
            loadPosts();
        } else {
            showToast('Failed to delete post', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

function handleSortChange() {
    console.log('Sort changed to:', elements.sortSelect?.value);
    renderPosts();
}

// Utility Functions
function showLoading(show) {
    elements.loadingSpinner.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="toast-icon fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span class="toast-message">${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function isPostLiked(post) {
    return currentUser && post.likes?.includes(currentUser.id);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
} 