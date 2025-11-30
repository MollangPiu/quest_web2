// ==================== 메인 네비게이션 (사이드바) ====================
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const navGroup = document.querySelector('.nav-group');
  const projectsNav = document.getElementById('projects-nav');

  navItems.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;

      // 프로젝트 관리 버튼 클릭 시 서브메뉴 토글
      if (tabName === 'projects') {
        navGroup.classList.toggle('expanded');
        
        // 서브메뉴가 펼쳐질 때만 화면 전환
        if (navGroup.classList.contains('expanded')) {
          // 모든 네비게이션 아이템 비활성화
          navItems.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          // 선택한 네비게이션 활성화
          button.classList.add('active');
          document.getElementById(tabName).classList.add('active');
        }
      } else {
        // 다른 메뉴 클릭 시 서브메뉴 닫기
        navGroup.classList.remove('expanded');
        
        // 모든 네비게이션 아이템 비활성화
        navItems.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // 선택한 네비게이션 활성화
        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
      }
    });
  });

  // ==================== 서브 네비게이션 (사이드바 내) ====================
  const subNavItems = document.querySelectorAll('.sub-nav-item');
  
  subNavItems.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // 부모 클릭 이벤트 방지
      const subTabName = button.dataset.subtab;

      // 모든 서브 네비게이션 아이템 비활성화
      subNavItems.forEach(btn => btn.classList.remove('active'));
      
      // 선택한 서브 네비게이션 활성화
      button.classList.add('active');

      // 프로젝트 화면의 서브 컨텐츠 전환
      const subContents = document.querySelectorAll('.sub-content');
      subContents.forEach(content => content.classList.remove('active'));
      const targetContent = document.getElementById(subTabName);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      // 서브탭 버튼도 연동
      const subTabs = document.querySelectorAll('.sub-tab');
      subTabs.forEach(tab => {
        if (tab.dataset.subtab === subTabName) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      // 상단 제목과 설명 변경
      updateProjectsHeader(subTabName);
    });
  });

  // ==================== 서브 탭 (프로젝트 관리 내부 상단) ====================
  const subTabs = document.querySelectorAll('.sub-tab');
  const subContents = document.querySelectorAll('.sub-content');

  subTabs.forEach(button => {
    button.addEventListener('click', () => {
      const subTabName = button.dataset.subtab;

      // 모든 서브 탭 비활성화
      subTabs.forEach(btn => btn.classList.remove('active'));
      subContents.forEach(content => content.classList.remove('active'));

      // 선택한 서브 탭 활성화
      button.classList.add('active');
      document.getElementById(subTabName).classList.add('active');

      // 사이드바 서브네비게이션도 연동
      subNavItems.forEach(nav => {
        if (nav.dataset.subtab === subTabName) {
          nav.classList.add('active');
        } else {
          nav.classList.remove('active');
        }
      });

      // 상단 제목과 설명 변경
      updateProjectsHeader(subTabName);
    });
  });

  // ==================== 프로젝트 헤더 업데이트 함수 ====================
  function updateProjectsHeader(subTabName) {
    // 각 서브 컨텐츠 안에 있는 소개 박스를 찾아서 표시/숨김
    // 현재 활성화된 탭의 소개 박스만 표시
  }

  // ==================== 오늘의 퀘스트 체크박스 ====================
  const questCheckboxes = document.querySelectorAll('.quest-checkbox input[type="checkbox"]');
  
  questCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const questCard = e.target.closest('.quest-card');
      if (e.target.checked) {
        questCard.classList.add('completed');
        questCard.setAttribute('data-status', 'completed');
        showToast('퀘스트 완료! 🎉', 'success');
      } else {
        questCard.classList.remove('completed');
        questCard.setAttribute('data-status', 'progress');
        showToast('퀘스트 미완료 처리', 'info');
      }
      updateQuestCounts();
      applyFilters();
    });
  });

  // ==================== 오늘의 퀘스트 필터링 ====================
  let currentFilters = {
    search: '',
    project: 'all',
    status: 'all',
    period: 'all'
  };

  // 검색 입력
  const questSearch = document.getElementById('quest-search');
  if (questSearch) {
    questSearch.addEventListener('input', (e) => {
      currentFilters.search = e.target.value.toLowerCase();
      applyFilters();
    });
  }

  // 프로젝트 필터
  const projectFilter = document.getElementById('project-filter');
  if (projectFilter) {
    projectFilter.addEventListener('change', (e) => {
      currentFilters.project = e.target.value;
      applyFilters();
    });
  }

  // 필터 버튼 클릭
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterType = button.getAttribute('data-filter');
      const filterValue = button.getAttribute('data-value');

      // 같은 그룹의 버튼들에서 active 제거
      const group = button.parentElement;
      group.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      // 클릭한 버튼 활성화
      button.classList.add('active');

      // 필터 적용
      currentFilters[filterType] = filterValue;
      applyFilters();
    });
  });

  // 필터 적용 함수
  function applyFilters() {
    const questCards = document.querySelectorAll('.quest-card');
    let visibleCount = { progress: 0, completed: 0 };

    questCards.forEach(card => {
      const title = card.querySelector('.quest-title').textContent.toLowerCase();
      const desc = card.querySelector('.quest-desc').textContent.toLowerCase();
      const project = card.getAttribute('data-project');
      const status = card.getAttribute('data-status');
      const period = card.getAttribute('data-period');

      let show = true;

      // 검색 필터
      if (currentFilters.search && !title.includes(currentFilters.search) && !desc.includes(currentFilters.search)) {
        show = false;
      }

      // 프로젝트 필터
      if (currentFilters.project !== 'all' && project !== currentFilters.project) {
        show = false;
      }

      // 상태 필터
      if (currentFilters.status !== 'all' && status !== currentFilters.status) {
        show = false;
      }

      // 기간 필터 (all이 아닐 때만 적용)
      if (currentFilters.period !== 'all' && period !== currentFilters.period) {
        show = false;
      }

      // 표시/숨김
      if (show) {
        card.style.display = 'flex';
        if (status === 'progress') visibleCount.progress++;
        if (status === 'completed') visibleCount.completed++;
      } else {
        card.style.display = 'none';
      }
    });

    // 카운트 업데이트
    const progressCountEl = document.querySelector('.progress-count');
    const completedCountEl = document.querySelector('.completed-count');
    if (progressCountEl) progressCountEl.textContent = visibleCount.progress;
    if (completedCountEl) completedCountEl.textContent = visibleCount.completed;

    // 섹션 숨김 처리
    const progressSection = document.querySelector('.quest-section:nth-child(1)');
    const completedSection = document.querySelector('.quest-section:nth-child(2)');
    
    if (progressSection) {
      progressSection.style.display = visibleCount.progress > 0 ? 'block' : 'none';
    }
    if (completedSection) {
      completedSection.style.display = visibleCount.completed > 0 ? 'block' : 'none';
    }

    // 결과 없음 메시지
    if (visibleCount.progress === 0 && visibleCount.completed === 0) {
      showNoResultsMessage();
    } else {
      hideNoResultsMessage();
    }
  }

  // 퀘스트 카운트 업데이트
  function updateQuestCounts() {
    const allCards = document.querySelectorAll('.quest-card');
    let counts = { total: 0, completed: 0, progress: 0 };

    allCards.forEach(card => {
      const status = card.getAttribute('data-status');
      counts.total++;
      if (status === 'completed') counts.completed++;
      if (status === 'progress') counts.progress++;
    });

    // 헤더 통계 업데이트
    const statBoxes = document.querySelectorAll('.stat-box');
    if (statBoxes[0]) statBoxes[0].querySelector('.stat-number').textContent = counts.total;
    if (statBoxes[1]) statBoxes[1].querySelector('.stat-number').textContent = counts.completed;
    if (statBoxes[2]) statBoxes[2].querySelector('.stat-number').textContent = counts.progress;
  }

  // 결과 없음 메시지 표시
  function showNoResultsMessage() {
    let noResultsEl = document.querySelector('.no-results-message');
    if (!noResultsEl) {
      noResultsEl = document.createElement('div');
      noResultsEl.className = 'no-results-message';
      noResultsEl.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--gray-500);">
          <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
          <h3 style="font-size: 18px; margin-bottom: 8px; color: var(--gray-700);">검색 결과가 없습니다</h3>
          <p style="font-size: 14px;">다른 검색어나 필터를 시도해보세요.</p>
        </div>
      `;
      document.querySelector('.today-quests').appendChild(noResultsEl);
    }
    noResultsEl.style.display = 'block';
  }

  // 결과 없음 메시지 숨김
  function hideNoResultsMessage() {
    const noResultsEl = document.querySelector('.no-results-message');
    if (noResultsEl) {
      noResultsEl.style.display = 'none';
    }
  }

  // 초기 카운트 설정
  updateQuestCounts();
});

// ==================== 로그아웃 ====================
function handleLogout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    alert('로그아웃 되었습니다.');
    // 실제 구현 시 로그인 페이지로 이동
    // window.location.href = '/login';
  }
}

// ==================== 프로젝트 관리 ====================
function openProjectModal() {
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  document.getElementById('project-create').classList.add('active');
  showToast('프로젝트 만들기 페이지로 이동합니다', 'info');
}

function closeProjectCreatePage() {
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  document.getElementById('projects').classList.add('active');
  showToast('프로젝트 만들기를 취소했습니다', 'info');
}

function saveProject() {
  const projectName = document.getElementById('project-name').value;
  const projectStartDate = document.getElementById('project-start-date').value;
  const projectEndDate = document.getElementById('project-end-date').value;
  
  if (!projectName) {
    showToast('프로젝트 제목을 입력해주세요!', 'error');
    return;
  }
  
  if (!projectStartDate || !projectEndDate) {
    showToast('시작일과 종료일을 입력해주세요!', 'error');
    return;
  }
  
  showToast('프로젝트가 생성되었습니다! 🎉', 'success');
  setTimeout(() => {
    closeProjectCreatePage();
  }, 2000);
}

function editProject(id) {
  // 프로젝트 수정 페이지로 이동
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  document.getElementById('project-edit').classList.add('active');
  
  // 기존 데이터 로드 (실제로는 서버에서 가져옴)
  // 예시 데이터
  const projectData = {
    1: { name: '10kg 다이어트', desc: '건강한 식단과 운동으로 목표 체중 달성하기', startDate: '2025-01-01', endDate: '2025-03-31', status: 'active' },
    2: { name: '대학원 진학 준비', desc: '학업 준비와 입학 서류 완성', startDate: '2025-01-15', endDate: '2025-06-30', status: 'active' },
    3: { name: '영어 공부', desc: '토익 900점 목표', startDate: '2025-02-01', endDate: '2025-04-30', status: 'active' }
  };
  
  const project = projectData[id];
  if (project) {
    document.getElementById('edit-project-name').value = project.name;
    document.getElementById('edit-project-desc').value = project.desc;
    document.getElementById('edit-project-start-date').value = project.startDate;
    document.getElementById('edit-project-end-date').value = project.endDate;
    document.getElementById('edit-project-status').value = project.status;
  }
  
  // 현재 수정 중인 프로젝트 ID 저장
  window.currentEditingProjectId = id;
  
  showToast('프로젝트 수정 페이지로 이동합니다', 'info');
}

function closeProjectEditPage() {
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  document.getElementById('projects').classList.add('active');
  showToast('프로젝트 수정을 취소했습니다', 'info');
}

function updateProject() {
  const projectName = document.getElementById('edit-project-name').value;
  const projectStartDate = document.getElementById('edit-project-start-date').value;
  const projectEndDate = document.getElementById('edit-project-end-date').value;
  
  if (!projectName) {
    showToast('프로젝트 제목을 입력해주세요!', 'error');
    return;
  }
  
  if (!projectStartDate || !projectEndDate) {
    showToast('시작일과 종료일을 입력해주세요!', 'error');
    return;
  }
  
  console.log(`프로젝트 ${window.currentEditingProjectId} 수정됨`);
  showToast('프로젝트가 수정되었습니다! 🎉', 'success');
  
  setTimeout(() => {
    closeProjectEditPage();
  }, 2000);
}

function deleteProject(id) {
  if (confirm(`프로젝트 ${id}를 삭제하시겠습니까?\n\n이 프로젝트에 연결된 과정과 퀘스트도 함께 삭제됩니다.`)) {
    alert(`프로젝트 ${id}가 삭제되었습니다.`);
  }
}

// ==================== 과제 관리 ====================
function openProcessModal() {
  // 프로젝트 선택 옵션이 있는지 확인
  const projectSelect = document.getElementById('process-project');
  const hasProjects = projectSelect && projectSelect.options.length > 1; // 첫번째는 "프로젝트를 선택하세요"
  
  if (!hasProjects) {
    showToast('⚠️ 먼저 프로젝트를 만들어주세요!', 'error');
    return;
  }
  
  // 과제 만들기 페이지로 전환
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  
  document.getElementById('process-create').classList.add('active');
  showToast('과제 만들기 페이지로 이동합니다', 'info');
}

function closeProcessCreatePage() {
  // 프로젝트 관리 화면으로 돌아가기
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  
  document.getElementById('projects').classList.add('active');
  showToast('과제 만들기를 취소했습니다', 'info');
}

function saveProcess() {
  const processName = document.getElementById('process-name').value;
  const processProject = document.getElementById('process-project').value;
  
  if (!processName) {
    showToast('과제 제목을 입력해주세요!', 'error');
    return;
  }
  
  if (!processProject) {
    showToast('프로젝트를 선택해주세요!', 'error');
    return;
  }
  
  showToast('과제가 생성되었습니다! 🎉', 'success');
  
  // 2초 후 프로젝트 관리 화면으로 돌아가기
  setTimeout(() => {
    closeProcessCreatePage();
  }, 2000);
}

function editProcess(id) {
  // 과제 수정 페이지로 이동
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  document.getElementById('process-edit').classList.add('active');
  
  // 기존 데이터 로드 (실제로는 서버에서 가져옴)
  const processData = {
    1: { name: '운동하기', desc: '주 3회 유산소 + 근력운동', project: 'diet', status: 'active' },
    2: { name: '식단 관리', desc: '칼로리 제한 및 단백질 섭취', project: 'diet', status: 'active' },
    3: { name: '서류 준비', desc: '자기소개서, 추천서, 성적증명서', project: 'grad', status: 'pending' }
  };
  
  const process = processData[id];
  if (process) {
    document.getElementById('edit-process-name').value = process.name;
    document.getElementById('edit-process-desc').value = process.desc;
    document.getElementById('edit-process-project').value = process.project;
    document.getElementById('edit-process-status').value = process.status;
  }
  
  // 현재 수정 중인 과제 ID 저장
  window.currentEditingProcessId = id;
  
  showToast('과제 수정 페이지로 이동합니다', 'info');
}

function closeProcessEditPage() {
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  document.getElementById('projects').classList.add('active');
  showToast('과제 수정을 취소했습니다', 'info');
}

function updateProcess() {
  const processName = document.getElementById('edit-process-name').value;
  const processProject = document.getElementById('edit-process-project').value;
  
  if (!processName) {
    showToast('과제 제목을 입력해주세요!', 'error');
    return;
  }
  
  if (!processProject) {
    showToast('프로젝트를 선택해주세요!', 'error');
    return;
  }
  
  console.log(`과제 ${window.currentEditingProcessId} 수정됨`);
  showToast('과제가 수정되었습니다! 🎉', 'success');
  
  setTimeout(() => {
    closeProcessEditPage();
  }, 2000);
}

// 수정 페이지 퀘스트 연결 토글
function toggleEditQuestConnect() {
  const toggle = document.getElementById('edit-quest-connect-toggle');
  const section = document.getElementById('edit-quest-connect-section');
  const isOff = toggle.classList.contains('off');
  
  if (isOff) {
    toggle.classList.remove('off');
    toggle.classList.add('on');
    toggle.querySelector('.toggle-status').textContent = 'ON';
    section.style.display = 'block';
    showToast('퀘스트 연결 활성화', 'success');
  } else {
    toggle.classList.remove('on');
    toggle.classList.add('off');
    toggle.querySelector('.toggle-status').textContent = 'OFF';
    section.style.display = 'none';
    // Reset selections
    document.querySelectorAll('#edit-quest-connect-section input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
    const selectedContainer = document.getElementById('edit-selected-quests');
    selectedContainer.innerHTML = '<p class="empty-message">연결할 퀘스트를 선택하세요</p>';
    showToast('퀘스트 연결 비활성화', 'info');
  }
}

function toggleEditQuestSelect(event, questId, questName, projectName, status) {
  const checkbox = event.target;
  const isChecked = checkbox.checked;
  
  if (isChecked) {
    addEditQuestTag(questId, questName, projectName);
  } else {
    removeEditQuestTagById(questId);
  }
}

function addEditQuestTag(questId, questName, projectName) {
  const selectedContainer = document.getElementById('edit-selected-quests');
  const emptyMessage = selectedContainer.querySelector('.empty-message');
  if (emptyMessage) {
    emptyMessage.remove();
  }
  
  const tag = document.createElement('div');
  tag.className = 'quest-tag';
  tag.setAttribute('data-quest', questId);
  tag.innerHTML = `
    <span class="quest-tag-name">${questName}</span>
    <span class="quest-tag-project">${projectName}</span>
    <button class="quest-tag-remove" onclick="removeEditQuestTag(event, '${questId}')">×</button>
  `;
  
  selectedContainer.appendChild(tag);
  setTimeout(() => {
    tag.style.opacity = '1';
    tag.style.transform = 'scale(1)';
  }, 10);
}

function removeEditQuestTag(event, questId) {
  event.stopPropagation();
  const checkbox = document.querySelector(`#edit-quest-connect-section input[value="${questId}"]`);
  if (checkbox) {
    checkbox.checked = false;
  }
  removeEditQuestTagById(questId);
  const selectedContainer = document.getElementById('edit-selected-quests');
  const tags = selectedContainer.querySelectorAll('.quest-tag');
  if (tags.length === 0) {
    selectedContainer.innerHTML = '<p class="empty-message">연결할 퀘스트를 선택하세요</p>';
  }
}

function removeEditQuestTagById(questId) {
  const selectedContainer = document.getElementById('edit-selected-quests');
  const tag = selectedContainer.querySelector(`.quest-tag[data-quest="${questId}"]`);
  if (tag) {
    tag.style.opacity = '0';
    tag.style.transform = 'scale(0.8)';
    setTimeout(() => {
      tag.remove();
    }, 200);
  }
}

function filterEditQuestList(searchTerm) {
  const items = document.querySelectorAll('#edit-quest-connect-section .quest-checkbox-item');
  const term = searchTerm.toLowerCase();
  items.forEach(item => {
    const name = item.querySelector('.quest-item-name').textContent.toLowerCase();
    if (name.includes(term)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

function deleteProcess(id) {
  if (confirm(`과제 ${id}를 삭제하시겠습니까?\n\n이 과제에 연결된 퀘스트도 함께 삭제됩니다.`)) {
    alert(`과제 ${id}가 삭제되었습니다.`);
  }
}

// ==================== 퀘스트 관리 ====================
function openQuestModal() {
  // 퀘스트 만들기 페이지로 전환
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  
  document.getElementById('quest-create').classList.add('active');
  showToast('퀘스트 만들기 페이지로 이동합니다', 'info');
}

function closeQuestCreatePage() {
  // 프로젝트 관리 화면으로 돌아가기
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  
  document.getElementById('projects').classList.add('active');
  showToast('퀘스트 만들기를 취소했습니다', 'info');
}

function saveQuest() {
  const questName = document.getElementById('quest-name').value;
  
  if (!questName) {
    showToast('퀘스트 이름을 입력해주세요!', 'error');
    return;
  }
  
  showToast('퀘스트가 생성되었습니다! 🎉', 'success');
  
  // 2초 후 프로젝트 관리 화면으로 돌아가기
  setTimeout(() => {
    closeQuestCreatePage();
  }, 2000);
}

function editQuest(id) {
  // 퀘스트 수정 페이지로 이동
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  document.getElementById('quest-edit').classList.add('active');
  
  // 기존 데이터 로드 (실제로는 서버에서 가져옴)
  const questData = {
    1: { 
      emoji: '🏃',
      name: '아침 30분 조깅', 
      desc: '매일 아침 6시, 30분 유산소 운동', 
      processIds: ['1'],
      type: 'repeat',
      typeDisplay: '반복형',
      cycleDisplay: '매일 (일간 반복)',
      inputMethodDisplay: '체크형 (완료/미완료)',
      status: 'in-progress',
      time: '06:00',
      startDate: '2025-01-01',
      endDate: ''
    },
    2: { 
      emoji: '📚',
      name: '영어 단어 50개 암기', 
      desc: '매주 월, 수, 금 저녁 7시', 
      processIds: ['5'],
      type: 'repeat',
      typeDisplay: '반복형',
      cycleDisplay: '특정 요일 (월, 수, 금)',
      inputMethodDisplay: '입력형 (숫자 50개)',
      status: 'completed',
      time: '19:00',
      startDate: '',
      endDate: ''
    },
    3: { 
      emoji: '📖',
      name: '매일 책 30분 읽기', 
      desc: '저녁 10시 독서 시간', 
      processIds: [],
      type: 'repeat',
      typeDisplay: '반복형',
      cycleDisplay: '주 5회 (주간 목표)',
      inputMethodDisplay: '입력형 (30분)',
      status: 'paused',
      time: '22:00',
      startDate: '',
      endDate: '2025-12-31'
    },
    4: { 
      emoji: '✍️',
      name: '자기소개서 작성', 
      desc: '대학원 입학 자기소개서 초안 작성', 
      processIds: ['3'],
      type: 'simple',
      typeDisplay: '단순형',
      cycleDisplay: '-',
      inputMethodDisplay: '체크형 (완료/미완료)',
      status: 'pending',
      startDate: '',
      endDate: '2025-03-15'
    }
  };
  
  const quest = questData[id];
  if (quest) {
    // 기본 정보
    document.getElementById('edit-emoji-display').textContent = quest.emoji;
    document.getElementById('edit-quest-name').value = quest.name;
    document.getElementById('edit-quest-desc').value = quest.desc;
    document.getElementById('edit-quest-status').value = quest.status;
    
    // 연결된 과제 선택 표시
    const processContainer = document.getElementById('edit-selected-processes');
    processContainer.innerHTML = '';
    
    // 매핑 정보
    const processMap = {
      '1': { name: '[10kg 다이어트] 운동하기', type: 'diet' },
      '2': { name: '[10kg 다이어트] 식단 관리', type: 'diet' },
      '3': { name: '[대학원 진학 준비] 서류 준비', type: 'grad' },
      '4': { name: '[대학원 진학 준비] 면접 준비', type: 'grad' },
      '5': { name: '[영어 공부] 영어 단어 암기', type: 'english' },
      '6': { name: '[영어 공부] 회화 연습', type: 'english' }
    };
    
    if (!quest.processIds || quest.processIds.length === 0) {
      // 독립 퀘스트
      processContainer.innerHTML = `
        <span class="process-tag no-process active" data-process="">
          <span class="tag-icon">📌</span>
          <span class="tag-text">독립 퀘스트</span>
          <button class="tag-remove" onclick="removeEditProcessTag(event, '')">×</button>
        </span>
      `;
      // 체크박스 체크
      const checkbox = document.querySelector('#edit-process-dropdown input[value=""]');
      if (checkbox) checkbox.checked = true;
    } else {
      // 연결된 과제들
      quest.processIds.forEach(processId => {
        const info = processMap[processId];
        if (info) {
          const tag = document.createElement('span');
          tag.className = 'process-tag active';
          tag.setAttribute('data-process', processId);
          tag.innerHTML = `
            <span class="tag-icon">📋</span>
            <span class="tag-text">${info.name}</span>
            <button class="tag-remove" onclick="removeEditProcessTag(event, '${processId}')">×</button>
          `;
          processContainer.appendChild(tag);
          
          // 체크박스 체크
          const checkbox = document.querySelector(`#edit-process-dropdown input[value="${processId}"]`);
          if (checkbox) checkbox.checked = true;
        }
      });
      
      // 독립 퀘스트 체크박스 해제
      const noProcessCheckbox = document.querySelector('#edit-process-dropdown input[value=""]');
      if (noProcessCheckbox) noProcessCheckbox.checked = false;
    }
    
    // 변경 불가 정보 표시
    document.getElementById('edit-quest-type-display').value = quest.typeDisplay;
    document.getElementById('edit-quest-cycle-display').value = quest.cycleDisplay;
    document.getElementById('edit-quest-input-method-display').value = quest.inputMethodDisplay;
    
    // 날짜 설정
    if (quest.startDate) {
      document.getElementById('edit-start-date').value = quest.startDate;
    }
    if (quest.endDate) {
      document.getElementById('edit-end-date').value = quest.endDate;
    }
    
    // 시간 설정
    if (quest.time) {
      document.getElementById('edit-quest-time').value = quest.time;
    }
  }
  
  // 현재 수정 중인 퀘스트 ID 저장
  window.currentEditingQuestId = id;
  
  showToast('퀘스트 수정 페이지로 이동합니다', 'info');
}

function closeQuestEditPage() {
  const allSections = document.querySelectorAll('.tab-content');
  allSections.forEach(section => section.classList.remove('active'));
  document.getElementById('projects').classList.add('active');
  showToast('퀘스트 수정을 취소했습니다', 'info');
}

function updateQuest() {
  const questName = document.getElementById('edit-quest-name').value;
  const emoji = document.getElementById('edit-emoji-display').textContent;
  const questDesc = document.getElementById('edit-quest-desc').value;
  const questStatus = document.getElementById('edit-quest-status').value;
  const startDate = document.getElementById('edit-start-date').value;
  const endDate = document.getElementById('edit-end-date').value;
  const time = document.getElementById('edit-quest-time').value;
  
  // 선택된 과제들 가져오기
  const selectedProcesses = Array.from(document.querySelectorAll('#edit-selected-processes .process-tag'))
    .map(tag => tag.getAttribute('data-process'));
  
  if (!questName) {
    showToast('퀘스트 이름을 입력해주세요!', 'error');
    return;
  }
  
  if (!emoji || emoji === '🎯') {
    showToast('이모지를 선택해주세요!', 'error');
    return;
  }
  
  console.log(`퀘스트 ${window.currentEditingQuestId} 수정됨:`, {
    name: questName,
    emoji: emoji,
    desc: questDesc,
    status: questStatus,
    processIds: selectedProcesses.filter(id => id !== ''),
    startDate: startDate,
    endDate: endDate,
    time: time
  });
  
  showToast('퀘스트가 수정되었습니다! 🎉', 'success');
  
  setTimeout(() => {
    closeQuestEditPage();
  }, 2000);
}

function deleteQuest(id) {
  if (confirm(`퀘스트 ${id}를 삭제하시겠습니까?\n\n이 퀘스트에서 생성된 TODO도 함께 삭제됩니다.`)) {
    alert(`퀘스트 ${id}가 삭제되었습니다.`);
  }
}

// ==================== 퀘스트 만들기 페이지 인터랙션 ====================
document.addEventListener('DOMContentLoaded', () => {
  // 퀘스트 타입 선택
  const questTypeOptions = document.querySelectorAll('.quest-type-option');
  const repeatSettings = document.querySelector('.repeat-settings');
  
  questTypeOptions.forEach(option => {
    option.addEventListener('click', () => {
      questTypeOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      const type = option.getAttribute('data-type');
      if (type === 'repeat') {
        repeatSettings.style.display = 'block';
        showToast('반복형 퀘스트를 선택했습니다', 'info');
      } else {
        repeatSettings.style.display = 'none';
        showToast('단순형 퀘스트를 선택했습니다', 'info');
      }
    });
  });
  
  // 반복 주기 선택 (일간/주간/월간/연간)
  const cycleBtns = document.querySelectorAll('.cycle-btn');
  cycleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cycleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const cycle = btn.getAttribute('data-cycle');
      
      // 모든 설정 숨기기
      document.querySelectorAll('.cycle-config').forEach(config => {
        config.style.display = 'none';
      });
      
      // 선택된 설정 보이기
      const selectedConfig = document.querySelector(`.${cycle}-cycle-config`);
      if (selectedConfig) {
        selectedConfig.style.display = 'block';
      }
      
      const cycleText = btn.querySelector('.cycle-text').textContent;
      showToast(`${cycleText} 퀘스트 선택`, 'info');
    });
  });
  
  // 일간 퀘스트 타입 선택 (매일/특정요일/N일마다)
  const dailyTypeBtns = document.querySelectorAll('.daily-type-btn');
  dailyTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dailyTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const dailyType = btn.getAttribute('data-daily-type');
      
      // 모든 일간 설정 숨기기
      document.querySelectorAll('.daily-type-config').forEach(config => {
        config.style.display = 'none';
      });
      
      // 선택된 설정 보이기
      const selectedConfig = document.querySelector(`.${dailyType}-config`);
      if (selectedConfig) {
        selectedConfig.style.display = 'block';
      }
      
      showToast(`${btn.textContent} 선택`, 'info');
    });
  });
  
  // 요일 선택
  const weekdayBtns = document.querySelectorAll('.weekday-btn');
  weekdayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const day = btn.textContent;
      const isActive = btn.classList.contains('active');
      showToast(`${day}요일 ${isActive ? '선택' : '선택 해제'}`, 'info');
    });
  });
  
  // 주차 선택
  const weekBtns = document.querySelectorAll('.week-btn');
  weekBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const week = btn.getAttribute('data-week');
      
      if (week === 'all') {
        // 매주 선택하면 다른 선택 해제
        weekBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showToast('매주 반복으로 설정했습니다', 'info');
      } else {
        // 특정 주 선택 시 매주 해제
        document.querySelector('.week-btn[data-week="all"]').classList.remove('active');
        btn.classList.toggle('active');
        
        const selectedWeeks = Array.from(document.querySelectorAll('.week-btn.active:not([data-week="all"])'))
          .map(b => b.textContent).join(', ');
        if (selectedWeeks) {
          showToast(`${selectedWeeks} 반복`, 'info');
        }
      }
    });
  });
  
  // 횟수 프리셋 버튼 (주간/월간/연간)
  const countPresetBtns = document.querySelectorAll('.count-preset');
  countPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const count = btn.getAttribute('data-count');
      const parent = btn.closest('.cycle-config');
      const input = parent ? parent.querySelector('.form-input-small') : null;
      
      if (input) {
        input.value = count;
        showToast(`${btn.textContent} 설정 완료`, 'success');
      }
    });
  });
  
  // 토글 버튼
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOff = btn.classList.contains('off');
      const targetId = btn.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      
      if (isOff) {
        btn.classList.remove('off');
        btn.classList.add('on');
        btn.textContent = 'ON';
        targetElement.style.display = 'block';
      } else {
        btn.classList.remove('on');
        btn.classList.add('off');
        btn.textContent = 'OFF';
        targetElement.style.display = 'none';
      }
    });
  });
  
  // 월간 퀘스트 타입 선택
  const monthlyTypeBtns = document.querySelectorAll('.monthly-type-btn');
  monthlyTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      monthlyTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const monthlyType = btn.getAttribute('data-monthly-type');
      document.querySelectorAll('.monthly-type-config').forEach(config => {
        config.style.display = 'none';
      });
      
      const selectedConfig = document.querySelector(`.monthly-cycle-config .${monthlyType}-type-config`);
      if (selectedConfig) {
        selectedConfig.style.display = 'block';
      }
      
      showToast(`월간 ${btn.textContent} 선택`, 'info');
    });
  });
  
  // 연간 퀘스트 타입 선택
  const yearlyTypeBtns = document.querySelectorAll('.yearly-type-btn');
  yearlyTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      yearlyTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const yearlyType = btn.getAttribute('data-yearly-type');
      document.querySelectorAll('.yearly-type-config').forEach(config => {
        config.style.display = 'none';
      });
      
      const selectedConfig = document.querySelector(`.yearly-cycle-config .${yearlyType}-type-config`);
      if (selectedConfig) {
        selectedConfig.style.display = 'block';
      }
      
      showToast(`연간 ${btn.textContent} 선택`, 'info');
    });
  });
  
  // 월간 날짜 선택 버튼
  const dateBtns = document.querySelectorAll('.date-btn:not(.custom-date-btn)');
  dateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const date = btn.getAttribute('data-date');
      document.getElementById('monthly-date').value = date;
      showToast(`매월 ${date}일 선택`, 'info');
    });
  });
  
  // 월간 직접 입력
  document.querySelector('.custom-date-btn')?.addEventListener('click', () => {
    dateBtns.forEach(b => b.classList.remove('active'));
    document.getElementById('monthly-date').focus();
    showToast('직접 입력 모드', 'info');
  });
  
  // 연간 날짜 프리셋
  const datePresetBtns = document.querySelectorAll('.date-preset-btn');
  datePresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const month = btn.getAttribute('data-month');
      const day = btn.getAttribute('data-day');
      
      document.getElementById('yearly-month').value = month;
      document.getElementById('yearly-day').value = day;
      showToast(`${btn.textContent} 선택`, 'info');
    });
  });
  
  // 입력 방법 선택
  const inputMethodOptions = document.querySelectorAll('.input-method-option');
  const inputDetailConfig = document.querySelector('.input-detail-config');
  const statusDetailConfig = document.querySelector('.status-detail-config');
  
  inputMethodOptions.forEach(option => {
    option.addEventListener('click', (event) => {
      // 이미 활성화된 옵션을 다시 클릭한 경우 무시
      if (option.classList.contains('active')) {
        return;
      }
      
      inputMethodOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      const method = option.getAttribute('data-method');
      const radio = option.querySelector('input[type="radio"]');
      radio.checked = true;
      
      // 각 타입에 맞는 상세 설정 표시
      inputDetailConfig.style.display = 'none';
      statusDetailConfig.style.display = 'none';
      
      if (method === 'input') {
        inputDetailConfig.style.display = 'block';
      } else if (method === 'status') {
        statusDetailConfig.style.display = 'block';
      }
      
      const methodName = option.querySelector('h4').textContent;
      showToast(`${methodName} 선택`, 'info');
    });
  });
});

// ==================== 상태형 옵션 관리 ====================
let statusOptionIndex = 4; // 기본 4개 (진행전, 진행중, 완료, 취소)

function addStatusOption() {
  const list = document.getElementById('status-options-list');
  const currentCount = list.querySelectorAll('.status-option-item').length;
  
  if (currentCount >= 10) {
    showToast('최대 10개까지만 추가할 수 있습니다', 'error');
    return;
  }
  
  // 랜덤 색상 생성
  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  
  const newItem = document.createElement('div');
  newItem.className = 'status-option-item';
  newItem.setAttribute('data-index', statusOptionIndex);
  newItem.innerHTML = `
    <span class="option-number">${currentCount + 1}</span>
    <input type="text" class="status-option-input" placeholder="옵션 이름" maxlength="20">
    <input type="color" class="status-color-picker" value="${randomColor}" title="색상 선택">
    <button class="btn-remove-option" onclick="removeStatusOption(${statusOptionIndex})">×</button>
  `;
  
  list.appendChild(newItem);
  statusOptionIndex++;
  updateStatusCount();
  showToast('옵션 추가됨', 'success');
}

function removeStatusOption(index) {
  const list = document.getElementById('status-options-list');
  const currentCount = list.querySelectorAll('.status-option-item').length;
  
  if (currentCount <= 2) {
    showToast('최소 2개 이상의 옵션이 필요합니다', 'error');
    return;
  }
  
  const item = list.querySelector(`[data-index="${index}"]`);
  if (item) {
    item.style.opacity = '0';
    item.style.transform = 'scale(0.8)';
    setTimeout(() => {
      item.remove();
      updateOptionNumbers();
      updateStatusCount();
      showToast('옵션 제거됨', 'info');
    }, 200);
  }
}

function updateOptionNumbers() {
  const items = document.querySelectorAll('.status-option-item');
  items.forEach((item, index) => {
    item.querySelector('.option-number').textContent = index + 1;
  });
}

function updateStatusCount() {
  const count = document.querySelectorAll('.status-option-item').length;
  document.getElementById('status-count-hint').textContent = `${count} / 10 옵션 사용 중`;
}

function loadStatusPreset(preset) {
  const list = document.getElementById('status-options-list');
  list.innerHTML = '';
  statusOptionIndex = 0;
  
  const presets = {
    progress: [
      { name: '진행전', color: '#6b7280' },
      { name: '진행중', color: '#3b82f6' },
      { name: '완료', color: '#22c55e' },
      { name: '취소', color: '#ef4444' }
    ],
    priority: [
      { name: '낮음', color: '#10b981' },
      { name: '보통', color: '#3b82f6' },
      { name: '높음', color: '#f59e0b' },
      { name: '긴급', color: '#ef4444' },
      { name: '최우선', color: '#dc2626' }
    ],
    grade: [
      { name: 'S', color: '#f59e0b' },
      { name: 'A', color: '#22c55e' },
      { name: 'B', color: '#3b82f6' },
      { name: 'C', color: '#8b5cf6' },
      { name: 'D', color: '#ef4444' },
      { name: 'F', color: '#6b7280' }
    ]
  };
  
  const options = presets[preset] || presets.progress;
  
  options.forEach((option, index) => {
    const newItem = document.createElement('div');
    newItem.className = 'status-option-item';
    newItem.setAttribute('data-index', index);
    newItem.innerHTML = `
      <span class="option-number">${index + 1}</span>
      <input type="text" class="status-option-input" value="${option.name}" placeholder="옵션 이름" maxlength="20">
      <input type="color" class="status-color-picker" value="${option.color}" title="색상 선택">
      <button class="btn-remove-option" onclick="removeStatusOption(${index})">×</button>
    `;
    list.appendChild(newItem);
  });
  
  statusOptionIndex = options.length;
  updateStatusCount();
  
  const presetNames = {
    progress: '진행 상태',
    priority: '우선순위',
    grade: '등급'
  };
  showToast(`${presetNames[preset]} 프리셋 불러옴`, 'success');
}

function viewQuestDetail(id) {
  alert(`퀘스트 ${id}의 상세 정보를 확인합니다.\n\n실제 구현 시 상세 정보 모달이 열립니다.`);
}

// ==================== 일정 관리 ====================
function addEvent() {
  alert('새 일정을 추가합니다.\n\n실제 구현 시 일정 추가 모달이 열립니다.');
}

// ==================== 친구 관리 ====================
function addFriend() {
  const friendEmail = prompt('추가할 친구의 이메일을 입력하세요:');
  if (friendEmail) {
    alert(`${friendEmail}에게 친구 요청을 보냈습니다.`);
  }
}

function viewFriendProfile(id) {
  alert(`친구 ${id}의 프로필을 확인합니다.\n\n실제 구현 시 프로필 모달이 열립니다.`);
}

function removeFriend(id) {
  if (confirm(`친구 ${id}를 삭제하시겠습니까?`)) {
    alert(`친구 ${id}가 삭제되었습니다.`);
  }
}

// ==================== 프로필 관리 ====================
function saveProfile() {
  alert('프로필 정보가 저장되었습니다! ✅');
}

function cancelEdit() {
  if (confirm('변경사항을 취소하시겠습니까?')) {
    alert('변경사항이 취소되었습니다.');
  }
}

// ==================== 토스트 알림 ====================
function showToast(message, type = 'info') {
  // 토스트 컨테이너 생성 (없을 경우)
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }

  // 토스트 생성
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // 타입별 색상
  const colors = {
    success: '#10b981',
    info: '#6366f1',
    warning: '#f59e0b',
    error: '#ef4444'
  };

  toast.style.cssText = `
    padding: 16px 20px;
    background: ${colors[type] || colors.info};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    font-weight: 500;
    min-width: 250px;
    max-width: 400px;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.3s ease;
  `;

  toastContainer.appendChild(toast);

  // 애니메이션
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);

  // 자동 제거
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// ==================== 과제 선택 (다중 선택) ====================
function toggleProcessSelector() {
  const dropdown = document.getElementById('process-dropdown');
  const toggle = document.querySelector('.process-selector-toggle');
  const mainContent = document.querySelector('.main-content');
  
  if (dropdown.style.display === 'none' || dropdown.style.display === '') {
    dropdown.style.display = 'block';
    toggle.classList.add('active');
    // 드롭다운이 열릴 때 main-content 스크롤 방지
    if (mainContent) {
      mainContent.style.overflow = 'hidden';
    }
  } else {
    dropdown.style.display = 'none';
    toggle.classList.remove('active');
    // 드롭다운이 닫힐 때 스크롤 복원
    if (mainContent) {
      mainContent.style.overflow = 'auto';
    }
  }
}

function toggleProcess(event, processId, processName, projectType) {
  const checkbox = event.target;
  const selectedContainer = document.getElementById('selected-processes');
  
  if (checkbox.checked) {
    // 독립 퀘스트 선택 시 다른 선택 해제
    if (processId === '') {
      // 모든 체크박스 해제
      document.querySelectorAll('.process-checkbox input[type="checkbox"]').forEach(cb => {
        if (cb.value !== '') {
          cb.checked = false;
        }
      });
      // 모든 태그 제거 (독립 퀘스트 제외)
      selectedContainer.querySelectorAll('.process-tag:not(.no-process)').forEach(tag => tag.remove());
      // 독립 퀘스트 태그 표시
      const noProcessTag = selectedContainer.querySelector('.no-process');
      if (noProcessTag) {
        noProcessTag.style.display = 'inline-flex';
        noProcessTag.style.opacity = '1';
        noProcessTag.style.transform = 'scale(1)';
      }
      showToast('독립 퀘스트로 설정', 'info');
    } else {
      // 독립 퀘스트 선택 해제
      const noProcessCheckbox = document.querySelector('.process-checkbox input[value=""]');
      if (noProcessCheckbox) {
        noProcessCheckbox.checked = false;
      }
      // 독립 퀘스트 태그 숨기기
      const noProcessTag = selectedContainer.querySelector('.no-process');
      if (noProcessTag) {
        noProcessTag.style.display = 'none';
      }
      
      // 새 태그 추가
      addProcessTag(processId, processName, projectType);
    }
  } else {
    // 체크 해제
    if (processId === '') {
      // 독립 퀘스트 해제
      const noProcessTag = selectedContainer.querySelector('.no-process');
      if (noProcessTag) {
        noProcessTag.style.display = 'none';
      }
    } else {
      removeProcessTagById(processId);
    }
    
    // 선택된 것이 없으면 독립 퀘스트 활성화
    const visibleTags = Array.from(selectedContainer.querySelectorAll('.process-tag')).filter(tag => {
      return tag.style.display !== 'none' && !tag.classList.contains('no-process');
    });
    
    if (visibleTags.length === 0) {
      const noProcessCheckbox = document.querySelector('.process-checkbox input[value=""]');
      const noProcessTag = selectedContainer.querySelector('.no-process');
      if (noProcessCheckbox && noProcessTag) {
        noProcessCheckbox.checked = true;
        noProcessTag.style.display = 'inline-flex';
        noProcessTag.style.opacity = '1';
        noProcessTag.style.transform = 'scale(1)';
        showToast('독립 퀘스트로 자동 설정', 'info');
      }
    }
  }
}

function addProcessTag(processId, processName, projectType) {
  const selectedContainer = document.getElementById('selected-processes');
  
  // 이미 있는지 확인
  if (selectedContainer.querySelector(`.process-tag[data-process="${processId}"]`)) {
    return;
  }
  
  // 아이콘 매핑
  const icons = {
    'diet': '💪',
    'grad': '🎓',
    'english': '🌍',
    'no-process': '📌'
  };
  
  // 프로젝트명과 과제명 분리 (예: "[10kg 다이어트] 운동하기" → "운동하기")
  let displayName = processName;
  let fullName = processName;
  const bracketMatch = processName.match(/\[(.+?)\]\s*(.+)/);
  if (bracketMatch) {
    displayName = bracketMatch[2]; // 과제명만
    fullName = processName; // 전체 (툴팁용)
  }
  
  const tag = document.createElement('span');
  tag.className = `process-tag ${projectType}`;
  tag.setAttribute('data-process', processId);
  tag.setAttribute('title', fullName); // 툴팁
  tag.innerHTML = `
    <span class="tag-icon">${icons[projectType] || '📋'}</span>
    <span class="tag-text">${displayName}</span>
    <button class="tag-remove" onclick="removeProcessTag(event, '${processId}')">×</button>
  `;
  
  selectedContainer.appendChild(tag);
  showToast(`"${displayName}" 추가됨`, 'success');
}

function removeProcessTag(event, processId) {
  event.stopPropagation();
  
  // 체크박스 해제
  const checkbox = document.querySelector(`.process-checkbox input[value="${processId}"]`);
  if (checkbox) {
    checkbox.checked = false;
  }
  
  removeProcessTagById(processId);
  
  // 선택된 것이 없으면 독립 퀘스트 활성화
  const selectedContainer = document.getElementById('selected-processes');
  const visibleTags = selectedContainer.querySelectorAll('.process-tag:not([style*="display: none"])');
  
  if (visibleTags.length === 0 || (visibleTags.length === 1 && visibleTags[0].classList.contains('no-process'))) {
    const noProcessCheckbox = document.querySelector('.process-checkbox input[value=""]');
    if (noProcessCheckbox) {
      noProcessCheckbox.checked = true;
    }
    const noProcessTag = selectedContainer.querySelector('.no-process');
    if (noProcessTag) {
      noProcessTag.style.display = 'inline-flex';
    }
  }
}

function removeProcessTagById(processId) {
  const selectedContainer = document.getElementById('selected-processes');
  const tag = selectedContainer.querySelector(`.process-tag[data-process="${processId}"]`);
  
  if (tag) {
    tag.style.opacity = '0';
    tag.style.transform = 'scale(0.8)';
    setTimeout(() => {
      tag.remove();
    }, 200);
  }
}

// 드롭다운 외부 클릭 시 닫기
document.addEventListener('click', (event) => {
  const dropdown = document.getElementById('process-dropdown');
  const selector = document.querySelector('.process-selector');
  const mainContent = document.querySelector('.main-content');
  
  if (dropdown && selector && !selector.contains(event.target)) {
    dropdown.style.display = 'none';
    document.querySelector('.process-selector-toggle')?.classList.remove('active');
    // 스크롤 복원
    if (mainContent) {
      mainContent.style.overflow = 'auto';
    }
  }
});

// ==================== 이모지 선택기 ====================
function toggleEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  const currentDisplay = picker.style.display;
  
  if (currentDisplay === 'none' || currentDisplay === '') {
    picker.style.display = 'block';
  } else {
    picker.style.display = 'none';
  }
}

function closeEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  picker.style.display = 'none';
}

function selectEmoji(emoji) {
  const display = document.getElementById('emoji-display');
  display.textContent = emoji;
  closeEmojiPicker();
  showToast(`이모지를 "${emoji}"로 변경했습니다!`, 'success');
}

function searchEmoji(keyword) {
  const emojiOptions = document.querySelectorAll('.emoji-option');
  const searchTerm = keyword.toLowerCase().trim();
  const activeTabs = document.querySelectorAll('.emoji-tab.active');
  const activeCategory = activeTabs.length > 0 ? activeTabs[0].getAttribute('data-category') : 'all';
  
  // 검색어가 없으면 카테고리 필터만 적용
  if (!searchTerm) {
    filterEmojiCategory(activeCategory);
    return;
  }
  
  // 검색어와 카테고리 둘 다 적용
  let visibleCount = 0;
  emojiOptions.forEach(option => {
    const keywords = option.getAttribute('data-keywords') || '';
    const category = option.getAttribute('data-category') || '';
    const matchesSearch = keywords.includes(searchTerm);
    const matchesCategory = activeCategory === 'all' || category === activeCategory;
    
    if (matchesSearch && matchesCategory) {
      option.classList.remove('hidden');
      visibleCount++;
    } else {
      option.classList.add('hidden');
    }
  });
}

function filterEmojiCategory(category) {
  const emojiOptions = document.querySelectorAll('.emoji-option');
  const emojiTabs = document.querySelectorAll('.emoji-tab');
  const searchInput = document.getElementById('emoji-search');
  
  // 탭 활성화 상태 변경
  emojiTabs.forEach(tab => {
    if (tab.getAttribute('data-category') === category) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // 검색어가 있으면 검색 기능 실행
  if (searchInput && searchInput.value.trim()) {
    searchEmoji(searchInput.value);
    return;
  }
  
  // 카테고리별 필터링
  if (category === 'all') {
    emojiOptions.forEach(option => {
      option.classList.remove('hidden');
    });
  } else {
    emojiOptions.forEach(option => {
      const optionCategory = option.getAttribute('data-category') || '';
      if (optionCategory === category) {
        option.classList.remove('hidden');
      } else {
        option.classList.add('hidden');
      }
    });
  }
}

// 이모지 선택기 외부 클릭 시 닫기
document.addEventListener('click', (event) => {
  const emojiSelector = document.querySelector('.emoji-selector');
  const picker = document.getElementById('emoji-picker');
  
  if (picker && emojiSelector && !emojiSelector.contains(event.target)) {
    picker.style.display = 'none';
  }
});

// ==================== 과제 만들기 - 퀘스트 연결 ====================
function toggleQuestConnect() {
  const toggle = document.getElementById('quest-connect-toggle');
  const section = document.getElementById('quest-connect-section');
  const isOff = toggle.classList.contains('off');
  
  if (isOff) {
    toggle.classList.remove('off');
    toggle.classList.add('on');
    toggle.querySelector('.toggle-status').textContent = 'ON';
    section.style.display = 'block';
    showToast('퀘스트 연결 활성화', 'success');
  } else {
    toggle.classList.remove('on');
    toggle.classList.add('off');
    toggle.querySelector('.toggle-status').textContent = 'OFF';
    section.style.display = 'none';
    
    // 선택 초기화
    document.querySelectorAll('#quest-connect-section input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
    const selectedContainer = document.getElementById('selected-quests');
    selectedContainer.innerHTML = '<p class="empty-message">연결할 퀘스트를 선택하세요</p>';
    
    showToast('퀘스트 연결 비활성화', 'info');
  }
}

function toggleQuestSelect(event, questId, questName, projectName, status) {
  const checkbox = event.target;
  const selectedContainer = document.getElementById('selected-quests');
  const emptyMessage = selectedContainer.querySelector('.empty-message');
  
  if (checkbox.checked) {
    // 빈 메시지 제거
    if (emptyMessage) {
      emptyMessage.remove();
    }
    
    // 새 태그 추가
    addQuestTag(questId, questName, projectName, status);
  } else {
    // 태그 제거
    removeQuestTagById(questId);
    
    // 선택된 것이 없으면 빈 메시지 표시
    const tags = selectedContainer.querySelectorAll('.quest-tag');
    if (tags.length === 0) {
      selectedContainer.innerHTML = '<p class="empty-message">연결할 퀘스트를 선택하세요</p>';
    }
  }
}

function addQuestTag(questId, questName, projectName, status) {
  const selectedContainer = document.getElementById('selected-quests');
  
  // 이미 있는지 확인
  if (selectedContainer.querySelector(`.quest-tag[data-quest="${questId}"]`)) {
    return;
  }
  
  // 상태별 배지 스타일
  const statusBadges = {
    'in-progress': { emoji: '🔥', text: '진행중', color: '#3b82f6' },
    'completed': { emoji: '✅', text: '완료', color: '#22c55e' },
    'paused': { emoji: '⏸️', text: '중단', color: '#f59e0b' },
    'pending': { emoji: '⚪', text: '진행전', color: '#6b7280' }
  };
  
  const badge = statusBadges[status] || statusBadges['pending'];
  
  const tag = document.createElement('span');
  tag.className = `quest-tag quest-status-${status}`;
  tag.setAttribute('data-quest', questId);
  tag.innerHTML = `
    <span class="quest-tag-name">${questName}</span>
    <span class="quest-tag-project">📁 ${projectName}</span>
    <button class="quest-tag-remove" onclick="removeQuestTag(event, '${questId}')">×</button>
  `;
  
  selectedContainer.appendChild(tag);
  showToast(`"${questName}" 연결됨`, 'success');
}

function removeQuestTag(event, questId) {
  event.stopPropagation();
  
  // 체크박스 해제
  const checkbox = document.querySelector(`#quest-connect-section input[value="${questId}"]`);
  if (checkbox) {
    checkbox.checked = false;
  }
  
  removeQuestTagById(questId);
  
  // 선택된 것이 없으면 빈 메시지 표시
  const selectedContainer = document.getElementById('selected-quests');
  const tags = selectedContainer.querySelectorAll('.quest-tag');
  if (tags.length === 0) {
    selectedContainer.innerHTML = '<p class="empty-message">연결할 퀘스트를 선택하세요</p>';
  }
}

function removeQuestTagById(questId) {
  const selectedContainer = document.getElementById('selected-quests');
  const tag = selectedContainer.querySelector(`.quest-tag[data-quest="${questId}"]`);
  
  if (tag) {
    tag.style.opacity = '0';
    tag.style.transform = 'scale(0.8)';
    setTimeout(() => {
      tag.remove();
    }, 200);
  }
}

function filterQuestList(keyword) {
  const questItems = document.querySelectorAll('.quest-checkbox-item');
  const searchTerm = keyword.toLowerCase().trim();
  
  let visibleCount = 0;
  questItems.forEach(item => {
    const questName = item.querySelector('.quest-item-name').textContent.toLowerCase();
    const projectName = item.querySelector('.quest-item-meta').textContent.toLowerCase();
    
    if (!searchTerm || questName.includes(searchTerm) || projectName.includes(searchTerm)) {
      item.style.display = 'flex';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });
  
  // 그룹별 표시/숨김
  const questGroups = document.querySelectorAll('.quest-group');
  questGroups.forEach(group => {
    const visibleItems = group.querySelectorAll('.quest-checkbox-item[style*="display: flex"], .quest-checkbox-item:not([style])');
    if (visibleItems.length === 0) {
      group.style.display = 'none';
    } else {
      group.style.display = 'block';
    }
  });
}

// ==================== 상태 변경 ====================
function toggleStatusDropdown(event, type, id) {
  event.stopPropagation();
  
  // 다른 모든 드롭다운 닫기
  document.querySelectorAll('.status-menu').forEach(menu => {
    menu.classList.remove('active');
  });
  
  // 클릭한 드롭다운 열기/닫기
  const button = event.currentTarget;
  const menu = button.nextElementSibling;
  menu.classList.toggle('active');
}

function changeStatus(event, type, id, statusClass, statusText) {
  event.stopPropagation();
  
  const option = event.currentTarget;
  const menu = option.parentElement;
  const button = menu.previousElementSibling;
  
  // 프로젝트/과제/퀘스트 타입별 상태 클래스 매핑
  const statusClassMap = {
    'active': 'status-active',
    'pending': 'status-pending',
    'completed': 'status-completed',
    'paused': 'status-paused',
    'in-progress': 'in-progress'
  };
  
  // 기존 상태 클래스 제거
  Object.values(statusClassMap).forEach(cls => {
    button.classList.remove(cls);
  });
  
  // 새 상태 클래스 추가
  button.classList.add(statusClassMap[statusClass] || statusClass);
  
  // 버튼 텍스트 변경
  button.innerHTML = statusText + ' ▼';
  
  // 드롭다운 닫기
  menu.classList.remove('active');
  
  // 토스트 메시지
  const typeText = type === 'project' ? '프로젝트' : type === 'process' ? '과제' : '퀘스트';
  showToast(`${typeText} 상태가 "${statusText}"(으)로 변경되었습니다`, 'success');
  
  console.log(`${type} ${id} 상태 변경: ${statusClass}`);
}

// 드롭다운 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
  if (!event.target.closest('.status-dropdown')) {
    document.querySelectorAll('.status-menu').forEach(menu => {
      menu.classList.remove('active');
    });
  }
});

// ==================== 퀘스트 수정 페이지 - 이모지 선택 ====================
function toggleEditEmojiPicker() {
  const picker = document.getElementById('edit-emoji-picker');
  picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}

function closeEditEmojiPicker() {
  document.getElementById('edit-emoji-picker').style.display = 'none';
}

function selectEditEmoji(emoji) {
  document.getElementById('edit-emoji-display').textContent = emoji;
  closeEditEmojiPicker();
}

function searchEditEmoji(query) {
  const grid = document.getElementById('edit-emoji-grid');
  const options = grid.querySelectorAll('.emoji-option');
  const searchQuery = query.toLowerCase();
  
  options.forEach(option => {
    const keywords = option.getAttribute('data-keywords') || '';
    const emoji = option.textContent;
    const matches = keywords.includes(searchQuery) || emoji.includes(query);
    option.style.display = matches || !query ? 'flex' : 'none';
  });
}

function filterEditEmojiCategory(category) {
  const grid = document.getElementById('edit-emoji-grid');
  const options = grid.querySelectorAll('.emoji-option');
  const tabs = document.querySelectorAll('#edit-emoji-picker .emoji-tab');
  
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-category') === category);
  });
  
  options.forEach(option => {
    const optionCategory = option.getAttribute('data-category');
    option.style.display = category === 'all' || optionCategory === category ? 'flex' : 'none';
  });
  
  document.getElementById('edit-emoji-search').value = '';
}

// ==================== 퀘스트 수정 페이지 - 과제 선택 ====================
function toggleEditProcessSelector() {
  const dropdown = document.getElementById('edit-process-dropdown');
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function toggleEditProcess(event, processId, processName, projectType) {
  const checkbox = event.target;
  const container = document.getElementById('edit-selected-processes');
  
  if (checkbox.checked) {
    // 태그 추가
    const tag = document.createElement('span');
    tag.className = `process-tag ${projectType === 'no-process' ? 'no-process' : ''} active`;
    tag.setAttribute('data-process', processId);
    tag.innerHTML = `
      <span class="tag-icon">${projectType === 'no-process' ? '📌' : '📋'}</span>
      <span class="tag-text">${processName}</span>
      <button class="tag-remove" onclick="removeEditProcessTag(event, '${processId}')">×</button>
    `;
    container.appendChild(tag);
  } else {
    // 태그 제거
    const tag = container.querySelector(`[data-process="${processId}"]`);
    if (tag) tag.remove();
  }
}

function removeEditProcessTag(event, processId) {
  event.stopPropagation();
  const container = document.getElementById('edit-selected-processes');
  const tag = container.querySelector(`[data-process="${processId}"]`);
  if (tag) tag.remove();
  
  // 체크박스 해제
  const dropdown = document.getElementById('edit-process-dropdown');
  const checkbox = dropdown.querySelector(`input[value="${processId}"]`);
  if (checkbox) checkbox.checked = false;
}

// ==================== 유틸리티 함수 ====================
console.log('퀘스트 워크스페이스가 로드되었습니다! 🎯');
