// Custom Reveal.js plugins for interactive features with Firebase

// Poll Plugin
const RevealPoll = {
  id: 'poll',
  init: function(reveal) {
    console.log('Poll plugin initialized');
    
    // Initialize poll listeners
    document.querySelectorAll('.poll').forEach(pollElement => {
      const pollId = pollElement.dataset.poll;
      const pollRef = firebase.database().ref('polls/' + pollId);
      
      // Listen for vote updates
      pollRef.on('value', (snapshot) => {
        const votes = snapshot.val() || { yes: 0, no: 0, maybe: 0 };
        console.log(`📊 Poll data for '${pollId}':`, JSON.stringify(votes, null, 2));
        
        // Update UI
        Object.keys(votes).forEach(option => {
          const resultElement = document.getElementById('result-' + option);
          if (resultElement) {
            const countSpan = resultElement.querySelector('.count');
            if (countSpan) {
              countSpan.textContent = votes[option] || 0;
            }
          }
        });
      });
      
      // Add click handlers to vote buttons
      pollElement.querySelectorAll('.poll-option').forEach(button => {
        button.addEventListener('click', () => {
          const option = button.dataset.option;

          // Increment vote in Firebase
          pollRef.child(option).transaction((currentVotes) => {
            return (currentVotes || 0) + 1;
          });

          // Build notification payload
          const payload = {
            type: 'vote',
            option: option,
            pollId: pollId,
            timestamp: Date.now()
          };

          // Broadcast vote notification to all users
          const notificationRef = firebase.database().ref('notifications');
          notificationRef.push(payload);

          // Visual feedback locally (press effect) and mirror via shared animator
          try {
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 220);
          } catch (e) { /* ignore */ }

          try {
            // Also run centralized animation so originator sees identical behavior
            animateNotification(payload);
          } catch (e) {}
        });
      });
    });
  }
};

// Emoji Reactions Plugin
const RevealEmoji = {
  id: 'emoji',
  init: function(reveal) {
    console.log('Emoji plugin initialized');
    
    document.querySelectorAll('.emoji-reactions').forEach(emojiContainer => {
      const slideIndex = Array.from(document.querySelectorAll('section')).indexOf(
        emojiContainer.closest('section')
      );
      const emojiRef = firebase.database().ref('emojis/slide-' + slideIndex);
      
      // Listen for emoji updates
      emojiRef.on('value', (snapshot) => {
        const emojis = snapshot.val() || {};
        console.log(`😊 Emoji data for slide-${slideIndex}:`, JSON.stringify(emojis, null, 2));
        
        // Update emoji counts
        emojiContainer.querySelectorAll('.emoji-btn').forEach(btn => {
          const emoji = btn.dataset.emoji;
          const countSpan = btn.querySelector('.emoji-count');
          if (countSpan) {
            countSpan.textContent = emojis[emoji] || 0;
          }
        });
      });
      
      // Add click handlers
      emojiContainer.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const emoji = btn.dataset.emoji;

          // Increment emoji count in Firebase
          emojiRef.child(emoji).transaction((currentCount) => {
            return (currentCount || 0) + 1;
          });

          // Build notification payload
          const payload = {
            type: 'reaction',
            emoji: emoji,
            slideIndex: slideIndex,
            timestamp: Date.now()
          };

          // Broadcast reaction notification to all users
          const notificationRef = firebase.database().ref('notifications');
          notificationRef.push(payload);

          // Local press animation and mirror via centralized animator
          try {
            btn.classList.add('pressed');
            setTimeout(() => btn.classList.remove('pressed'), 220);
          } catch (e) { /* ignore */ }

          try {
            animateNotification(payload);
          } catch (e) {}
        });
      });
    });
  }
};

// toasts removed: feedback uses button/emoji animations only

// Centralized animator so local and remote notifications use same logic
function animateNotification(notification) {
  if (!notification) return;
  try {
    if (notification.type === 'vote') {
      const pollEl = document.querySelector(`.poll[data-poll="${notification.pollId}"]`);
      if (pollEl) {
        const btn = pollEl.querySelector(`[data-option="${notification.option}"]`);
        if (btn) {
          btn.classList.add('pressed');
          setTimeout(() => btn.classList.remove('pressed'), 220);
        }
      }
    } else if (notification.type === 'reaction') {
      const slideIdx = notification.slideIndex;
      const slide = document.querySelectorAll('section')[slideIdx];
      if (slide) {
        const emojiBtn = slide.querySelector(`.emoji-btn[data-emoji="${notification.emoji}"]`);
        if (emojiBtn) {
          emojiBtn.classList.add('pressed');
          setTimeout(() => emojiBtn.classList.remove('pressed'), 260);
        }
      }
    }
  } catch (e) { console.warn('animateNotification error', e); }
}

// Listen for global notifications from all users
if (typeof firebase !== 'undefined') {
  setTimeout(() => {
    const notificationRef = firebase.database().ref('notifications');

    // Listen for new notifications and animate consistently (only latest)
    notificationRef.limitToLast(1).on('child_added', (snapshot) => {
      const notification = snapshot.val();
      if (notification && Date.now() - notification.timestamp < 5000) {
        try { animateNotification(notification); } catch (e) {}
      }
    });
  }, 800); // small delay to avoid replaying old notifications on load
}

// global toast removed
