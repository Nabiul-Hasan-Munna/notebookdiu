/**
 * UniverseDIU - Interactive Application Logic
 * Supports all 12 screen views, navigation, state management, and real-time interaction
 */

// Application State
const state = {
  currentView: 1, // 1 to 12
  user: {
    name: "Nabiul Hasan Munna",
    studentId: "201-15-14231",
    email: "nabiul@diu.edu.bd",
    department: "Software Engineering",
    batch: "43",
    knowledgePoints: 1245,
    stats: { posts: 38, resources: 27, answers: 64, helpful: 154 }
  },
  posts: [
    {
      id: "post-1",
      author: "Rafiul Islam",
      authorMeta: "Software Engineering • Batch 43",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      time: "2h ago",
      badge: "Resource",
      badgeColor: "sky",
      title: "React CRUD with Express & MySQL",
      content: "A beginner-friendly tutorial for building a CRUD application using React, Express and MySQL. Includes step-by-step guide, code examples and GitHub repository.",
      tags: ["React", "Express", "MySQL", "SE-322"],
      attachment: {
        name: "React_CRUD_Tutorial.pdf",
        size: "2.4 MB",
        type: "PDF",
        icon: "pdf"
      },
      helpful: 46,
      hasLiked: false,
      commentsCount: 12,
      saved: false
    },
    {
      id: "post-2",
      author: "Nabiul Hasan Munna",
      authorMeta: "Software Engineering • Batch 43",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
      time: "5h ago",
      badge: "Knowledge",
      badgeColor: "indigo",
      title: "Understanding JWT Authentication",
      content: "JWT (JSON Web Token) is a compact, URL-safe token format used for securely transmitting information between parties. Here is how signature verification prevents tampering...",
      tags: ["JWT", "Express", "Security"],
      attachment: null,
      helpful: 24,
      hasLiked: false,
      commentsCount: 8,
      saved: false
    }
  ],
  comments: [
    {
      id: "c-1",
      author: "Nayeen Ahmed",
      meta: "Software Engineering • Batch 42",
      time: "2h ago",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      text: "This is really helpful! Thank you for sharing ❤️",
      helpful: 5,
      hasLiked: false,
      replies: [
        {
          id: "r-1",
          author: "Rafiul Islam",
          authorTag: "Author",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
          text: "Glad it helped! Let me know if you need more resources."
        },
        {
          id: "r-2",
          author: "Farah Tasnim",
          meta: "Batch 44",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
          text: "Can you please add a video version of this tutorial?"
        }
      ]
    }
  ],
  exploreItems: [
    {
      id: 1,
      title: "React CRUD Tutorial",
      author: "Rafiul Islam",
      time: "2h ago",
      tags: ["React", "Express", "MySQL"],
      type: "PDF",
      badgeType: "pdf",
      downloads: "1.2k"
    },
    {
      id: 2,
      title: "Building a CRUD App with React & Node.js",
      author: "Tanzim Rahman",
      time: "4h ago",
      tags: ["React", "Node.js", "MongoDB"],
      type: "Video",
      badgeType: "video",
      downloads: "840"
    },
    {
      id: 3,
      title: "GitHub Repository - React CRUD",
      author: "Jannatul Ferdous",
      time: "1d ago",
      tags: ["React", "Express"],
      type: "Link",
      badgeType: "link",
      downloads: "530"
    },
    {
      id: 4,
      title: "React CRUD - Study Notes",
      author: "Alif Hasan",
      time: "1d ago",
      tags: ["React", "Notes"],
      type: "Notes",
      badgeType: "pdf",
      downloads: "310"
    }
  ],
  savedItems: [
    {
      id: "s-1",
      title: "React CRUD Tutorial",
      author: "Rafiul Islam",
      time: "2h ago",
      tags: ["React", "Express", "MySQL"],
      type: "PDF",
      badge: "PDF",
      badgeColor: "rose"
    },
    {
      id: "s-2",
      title: "Node.js Best Practices",
      author: "Tanzim Rahman",
      time: "1d ago",
      tags: ["Node.js", "Backend"],
      type: "Link",
      badge: "Link",
      badgeColor: "teal"
    },
    {
      id: "s-3",
      title: "Database Design Guide",
      author: "Hasan Mahmud",
      time: "2d ago",
      tags: ["DBMS", "SQL"],
      type: "PDF",
      badge: "PDF",
      badgeColor: "rose"
    },
    {
      id: "s-4",
      title: "System Design for Beginners",
      author: "Tanjila Akter",
      time: "3d ago",
      tags: ["Architecture", "System"],
      type: "Video",
      badge: "Video",
      badgeColor: "blue"
    }
  ],
  composerTags: ["React", "Express", "MySQL", "CRUD"],
  composerType: "Knowledge"
};

// View Navigator
function switchView(viewNumber) {
  state.currentView = parseInt(viewNumber);
  window.location.hash = `page-${state.currentView}`;

  // Hide all view containers
  document.querySelectorAll('.view-page').forEach(el => {
    el.classList.add('hidden');
  });

  // Show active container
  const activeContainer = document.getElementById(`view-${state.currentView}`);
  if (activeContainer) {
    activeContainer.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update switcher pill buttons active styling
  document.querySelectorAll('.switcher-btn').forEach(btn => {
    const v = parseInt(btn.getAttribute('data-view'));
    if (v === state.currentView) {
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
      btn.classList.remove('text-slate-600', 'hover:bg-slate-100', 'bg-white');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
      btn.classList.add('text-slate-600', 'hover:bg-slate-100', 'bg-white');
    }
  });

  // If entering Admin Dashboard, re-render chart
  if (state.currentView === 11) {
    setTimeout(initAdminChart, 50);
  }
}

// Interactive Reactions: Helpful toggle
function toggleHelpful(postId) {
  const post = state.posts.find(p => p.id === postId) || state.posts[0];
  if (!post) return;
  post.hasLiked = !post.hasLiked;
  post.helpful += post.hasLiked ? 1 : -1;

  // Update all elements displaying this post's helpful count
  document.querySelectorAll(`.helpful-count-${post.id}`).forEach(el => {
    el.textContent = `${post.helpful} Helpful`;
  });
  document.querySelectorAll(`.helpful-btn-${post.id}`).forEach(el => {
    if (post.hasLiked) {
      el.classList.add('text-blue-600', 'font-semibold');
      el.classList.remove('text-slate-500');
    } else {
      el.classList.remove('text-blue-600', 'font-semibold');
      el.classList.add('text-slate-500');
    }
  });
}

// Interactive Bookmark Toggle
function toggleSave(postId) {
  const post = state.posts.find(p => p.id === postId) || state.posts[0];
  if (!post) return;
  post.saved = !post.saved;

  document.querySelectorAll(`.save-btn-${post.id}`).forEach(el => {
    const textSpan = el.querySelector('.save-text') || el;
    if (post.saved) {
      el.classList.add('text-blue-600', 'font-semibold');
      textSpan.textContent = 'Saved';
      showToast('Saved to your collection! 🔖');
    } else {
      el.classList.remove('text-blue-600', 'font-semibold');
      textSpan.textContent = 'Save';
      showToast('Removed from saved items');
    }
  });
}

// Add Comment Functionality
function addComment(authorName, text, targetRepliesContainer = null) {
  if (!text || text.trim() === '') return;
  
  if (targetRepliesContainer) {
    // Adding reply
    const replyItem = document.createElement('div');
    replyItem.className = 'flex items-start gap-3 mt-3 pl-4 border-l-2 border-slate-200';
    replyItem.innerHTML = `
      <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80" class="w-7 h-7 rounded-full object-cover" />
      <div class="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-semibold text-slate-900">${state.user.name}</span>
          <span class="text-slate-400">• Just now</span>
        </div>
        <p class="text-slate-700">${escapeHtml(text)}</p>
      </div>
    `;
    targetRepliesContainer.appendChild(replyItem);
  } else {
    // New Root Comment
    const commentContainer = document.getElementById('comments-list-container');
    if (!commentContainer) return;

    const newComment = document.createElement('div');
    newComment.className = 'flex items-start gap-3 pb-4 border-b border-slate-100';
    newComment.innerHTML = `
      <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80" class="w-9 h-9 rounded-full object-cover" />
      <div class="flex-1">
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div class="flex items-center justify-between mb-1">
            <span class="font-semibold text-xs text-slate-900">${state.user.name}</span>
            <span class="text-[11px] text-slate-400">Just now</span>
          </div>
          <div class="text-[11px] text-slate-500 mb-1.5">${state.user.department} • Batch ${state.user.batch}</div>
          <p class="text-xs text-slate-700 leading-relaxed">${escapeHtml(text)}</p>
        </div>
        <div class="flex items-center gap-4 mt-1.5 ml-2 text-[11px] text-slate-500 font-medium">
          <button class="hover:text-blue-600 flex items-center gap-1">Helpful 0</button>
          <span>•</span>
          <button class="hover:text-blue-600">Reply</button>
        </div>
      </div>
    `;
    commentContainer.prepend(newComment);
  }
  showToast('Comment posted successfully!');
}

// Publish New Post
function publishPost(title, content, department, course, type, tags) {
  const newPost = {
    id: `post-${Date.now()}`,
    author: state.user.name,
    authorMeta: `${department} • Batch ${state.user.batch}`,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    time: "Just now",
    badge: type || "Knowledge",
    badgeColor: "indigo",
    title: title || "New Community Post",
    content: content || "No content provided",
    tags: tags.length ? tags : ["General"],
    attachment: null,
    helpful: 0,
    hasLiked: false,
    commentsCount: 0,
    saved: false
  };

  state.posts.unshift(newPost);
  showToast('🎉 Your post has been published to UniverseDIU!');
  switchView(2); // Redirect to Home Feed
}

// Search Filter
function filterExplore(keyword, filterType = 'all') {
  keyword = (keyword || '').toLowerCase();
  const filtered = state.exploreItems.filter(item => {
    const matchesKeyword = !keyword || 
      item.title.toLowerCase().includes(keyword) || 
      item.tags.some(t => t.toLowerCase().includes(keyword)) ||
      item.author.toLowerCase().includes(keyword);
    const matchesType = filterType === 'all' || item.type.toLowerCase() === filterType.toLowerCase();
    return matchesKeyword && matchesType;
  });

  renderExploreResults(filtered);
}

function renderExploreResults(items) {
  const container = document.getElementById('explore-results-list');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white rounded-2xl border border-slate-100">
        <div class="text-3xl mb-2">🔍</div>
        <h4 class="font-semibold text-slate-800 text-sm">No resources found</h4>
        <p class="text-xs text-slate-500 mt-1">Try searching with different keywords like 'React', 'SE-322' or 'SQL'.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer" onclick="switchView(4)">
      <div class="flex items-start gap-3.5">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          item.type === 'PDF' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
          item.type === 'Video' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
          item.type === 'Link' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
          'bg-indigo-50 text-indigo-600 border border-indigo-100'
        }">
          ${
            item.type === 'PDF' ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>' :
            item.type === 'Video' ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' :
            item.type === 'Link' ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>' :
            '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>'
          }
        </div>
        <div>
          <h4 class="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">${item.title}</h4>
          <p class="text-xs text-slate-500 mt-0.5">${item.author} • ${item.time}</p>
          <div class="flex items-center gap-1.5 mt-2">
            ${item.tags.map(t => `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">#${t}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
          item.type === 'PDF' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
          item.type === 'Video' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
          item.type === 'Link' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
          'bg-slate-100 text-slate-700'
        }">${item.type}</span>
      </div>
    </div>
  `).join('');
}

// Chart.js Admin Chart Initialization
let adminChartInstance = null;
function initAdminChart() {
  const canvas = document.getElementById('adminResourceChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (adminChartInstance) {
    adminChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  adminChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Resource Uploads',
        data: [180, 240, 210, 390, 480, 320],
        backgroundColor: '#3b82f6',
        hoverBackgroundColor: '#2563eb',
        borderRadius: 6,
        barThickness: 24
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0b1a3c',
          padding: 10,
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, family: 'Plus Jakarta Sans' }, color: '#64748b' }
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: { font: { size: 11, family: 'Plus Jakarta Sans' }, color: '#64748b' },
          beginAtZero: true
        }
      }
    }
  });
}

// Helper: Toast Notifications
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-[2000] bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-medium shadow-2xl flex items-center gap-2 transition-all opacity-0 translate-y-4 pointer-events-none';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 2600);
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.innerText = string;
  return div.innerHTML;
}

// Listen to Hash change or initialization
window.addEventListener('DOMContentLoaded', () => {
  // Check hash
  const hash = window.location.hash;
  if (hash && hash.startsWith('#page-')) {
    const pageNum = parseInt(hash.replace('#page-', ''));
    if (pageNum >= 1 && pageNum <= 12) {
      switchView(pageNum);
      return;
    }
  }
  // Default to Page 1 (or can default to 1, user can switch instantly)
  switchView(1);
});
