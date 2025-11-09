document.addEventListener('DOMContentLoaded', () => {
    const messageText = document.getElementById('message-text');
    const optionsContainer = document.getElementById('options-container');
    const imagePlaceholder = document.getElementById('image-placeholder');
    const currentBacteriaCountSpan = document.getElementById('current-bacteria-count');

    let currentBacteriaCount = 1000; // 초기 세균 수
    let currentScenarioId = 'start';

    const scenarioData = [
        {
            type: 'scenario',
            id: 'start',
            message: "안녕하세요, 학생 여러분! '세균의 침투 일지' 시뮬레이터에 오신 것을 환영합니다. 당신은 지금 <span class='keywords'>황색포도알균</span>입니다. 숙주의 몸에 침투하여 감염을 일으키는 것이 당신의 목표입니다. 하지만 숙주의 면역 시스템은 생각보다 강력할 겁니다! 먼저, 어디로 침투할지 선택해주세요. 현재 세균 수: <span id='bacteria-count-start'></span>마리",
            imagePrompt: "microscopic image of a single Staphylococcus aureus bacterium, stylized with a determined or curious expression, looking towards a vast, complex human body in the background, like a tiny explorer facing a huge challenge. Use a vibrant, engaging style suitable for educational content.",
            options: [
                { text: "건강한 피부를 뚫고 침투를 시도한다.", nextStep: 'healthySkin' },
                { text: "작은 '상처가 있는 피부'를 통해 침투를 시도한다.", nextStep: 'injuredSkin' },
                { text: "숙주가 호흡할 때 '호흡기 점막'을 통해 침투를 시도한다.", nextStep: 'respiratoryMucosa' },
                { text: "숙주가 음식을 섭취할 때 '소화기 점막(위장)'을 통해 침투를 시도한다.", nextStep: 'digestiveMucosa' }
            ]
        },
        {
            type: 'scenario',
            id: 'healthySkin',
            message: "당신은 건강한 피부를 뚫으려고 시도합니다.<br> 실패! 숙주의 피부는 완벽한 물리적, 화학적 방어막을 형성하여 당신의 침투를 허락하지 않습니다. 이곳에서는 더 이상 진전할 수 없습니다.<br><br> 다른 방법을 찾아야 합니다. 다시 침투할 곳을 선택해주세요:",
            imagePrompt: "magnified cross-section of intact human skin, showing tightly packed epidermal cells, a visible stratum corneum layer acting as a strong barrier, with small, frustrated-looking bacteria bouncing off the surface. Use a scientific illustration style with clear labels for skin layers.",
            options: [
                { text: "작은 '상처가 있는 피부'를 통해 침투를 시도한다.", nextStep: 'injuredSkin' },
                { text: "숙주가 호흡할 때 '호흡기 점막'을 통해 침투를 시도한다.", nextStep: 'respiratoryMucosa' },
                { text: "숙주가 음식을 섭취할 때 '소화기 점막(위장)'을 통해 침투를 시도한다.", nextStep: 'digestiveMucosa' }
            ]
        },
        {
            type: 'scenario',
            id: 'injuredSkin',
            message: "당신은 작은 상처를 통해 침투를 시도합니다.<br> 성공! 당신은 숙주의 1차 방어선 중 하나인 피부를 뚫고 드디어 몸 안으로 들어왔습니다!<br><br> 이제 당신은 숙주의 몸 안으로 들어왔습니다. 이제 증식을 시작해야 할까요?<br> 하지만... 어? 저건 뭐지? 거대한 세포들이 나를 향해 다가옵니다!",
            imagePrompt: "close-up microscopic view of a jagged wound opening in the skin, with multiple Staphylococcus aureus bacteria successfully entering through the breach. Show some red blood cells and tissue fluid around the entry point, indicating an internal environment access. Focus on the bacteria's perspective of finally breaking through.",
            nextStep: 'phagocytosis' // 자동으로 다음 단계로 넘어감
        },
        {
            type: 'scenario',
            id: 'respiratoryMucosa',
            message: "당신은 호흡기 점막을 통해 침투를 시도합니다. ... 대부분의 세균이 끈적한 <span class='keywords'>점액</span>에 의해 갇히고, <span class='keywords'>라이소자임</span>에 의해 세균들이 제거되었습니다. 살아남은 세균 수는 매우 적습니다. (남은 세균 수: <span id='bacteria-count-resp'></span>마리)<br><br> 이곳에서는 더 이상 진전할 수 없습니다. 다시 침투할 곳을 선택해주세요:",
            imagePrompt: "microscopic view of respiratory mucosal lining, with dense mucus trapping numerous Staphylococcus aureus bacteria. Show some bacteria breaking apart or dissolving, indicating the action of lysozyme. Cilia might be present but less prominent, with focus on the mucus and bacterial destruction. Emphasize the challenging environment for the bacteria.",
            bacteriaEffect: -0.85, // 세균 85% 감소
            options: [
                { text: "건강한 피부를 뚫고 침투를 시도한다.", nextStep: 'healthySkin' },
                { text: "작은 '상처가 있는 피부'를 통해 침투를 시도한다.", nextStep: 'injuredSkin' },
                { text: "숙주가 음식을 섭취할 때 '소화기 점막(위장)'을 통해 침투를 시도한다.", nextStep: 'digestiveMucosa' }
            ]
        },
        {
            type: 'scenario',
            id: 'digestiveMucosa',
            message: "당신은 소화기 점막(위장)을 통해 침투를 시도합니다. ... 극심한 <span class='keywords'>위산</span> 환경으로 인해 대부분의 세균이 파괴되었습니다. 살아남은 세균은 거의 없습니다. (남은 세균 수: <span id='bacteria-count-digest'></span>마리)<br><br> 이곳에서는 더 이상 진전할 수 없습니다. 다시 침투할 곳을 선택해주세요:",
            imagePrompt: "internal view of the stomach lining with visible gastric pits, depicting an extremely harsh acidic environment. Multiple Staphylococcus aureus bacteria are shown being violently destroyed or dissolving in highly corrosive stomach acid. Emphasize the destructive power of the acid with swirling, greenish-yellow liquid and dissolving bacterial shapes.",
            bacteriaEffect: -0.95, // 세균 95% 감소
            options: [
                { text: "건강한 피부를 뚫고 침투를 시도한다.", nextStep: 'healthySkin' },
                { text: "작은 '상처가 있는 피부'를 통해 침투를 시도한다.", nextStep: 'injuredSkin' },
                { text: "숙주가 호흡할 때 '호흡기 점막'을 통해 침투를 시도한다.", nextStep: 'respiratoryMucosa' }
            ]
        },
        {
            type: 'scenario',
            id: 'phagocytosis',
            message: "숙주의 몸속으로 들어온 당신을 향해 거대한 세포들이 다가오고 있습니다. 이들은 바로 숙주의 방어 세포인 <span class='keywords'>대식세포</span>입니다.<br> 대식세포들은 당신과 당신의 동료들을 끊임없이 <span class='keywords'>잡아먹습니다</span>! 당신의 동료들은 대부분 잡아먹혔습니다. (남은 세균 수: <span id='bacteria-count-phago'></span>마리)<br><br> 하지만 끝이 아닙니다. 이 세포들의 활동과 동시에 주변 조직이 붉게 변하고 뜨거워지는 것이 느껴집니다! 혈관에서 액체와 다른 방어 세포들이 쏟아져 나옵니다! 도망가야 해!<br> 이것은 무엇일까요? 다음 방어선과 마주했습니다.",
            imagePrompt: "A large, amoeba-like macrophage actively engulfing several small Staphylococcus aureus bacteria. Show the macrophage extending pseudopods to encircle and internalize the bacteria within a phagosome. Illustrate the contrast in size between the macrophage and the bacteria, emphasizing the eating process. Use a clear, scientific diagram style.",
            imagePrompt2: "Microscopic view of a blood vessel dilating and immune cells (white blood cells, like macrophages and monocytes) migrating out of the vessel into the surrounding infected tissue. Show fluid leakage causing slight swelling, illustrating the early stages of inflammation. Bacteria are present in the tissue, being approached by new immune cells.",
            bacteriaEffect: -0.7, // 세균 70% 감소
            nextStep: 'inflammation' // 자동으로 다음 단계로 넘어감
        },
        {
            type: 'scenario',
            id: 'inflammation',
            message: "방어 세포들의 활동과 더불어, 침입 부위 주변이 붉게 변하고 뜨거워지는 현상이 일어나고 있습니다. 이것이 바로 <span class='keywords'>염증 반응</span>입니다. 혈관이 확장되고 더 많은 면역 세포와 액체가 침입 부위로 모여들어 당신을 포위하고 공격합니다. 결국 살아남은 세균은 극히 소수에 불과합니다. (남은 세균 수: <span id='bacteria-count-inflam'></span>마리)",
            imagePrompt: "Exaggerated microscopic view of inflamed tissue. Show capillaries significantly dilated, with increased blood flow indicated by many red blood cells. Multiple white blood cells (macrophages, lymphocytes) are densely concentrated in the tissue, actively attacking remaining Staphylococcus aureus bacteria. Illustrate swelling and redness abstractly with surrounding tissue effects, showing overwhelming immune response.",
            bacteriaEffect: -0.8, // 세균 80% 감소
            nextStep: 'finalResult' // 자동으로 다음 단계로 넘어감
        },
        {
            type: 'scenario',
            id: 'finalResult',
            message: "시뮬레이션 결과: 당신(황색포도알균)은 숙주의 선천적 면역 시스템에 의해 대부분 제거되었습니다. 최종적으로 숙주 조직을 감염시키는 데 성공한 비율은 <span id='final-infection-rate'></span>%에 불과합니다.",
            imagePrompt: "A defeated-looking, very small Staphylococcus aureus bacterium standing alone on a tiny patch of tissue, surrounded by a vast, empty landscape representing the cleared host body. In the background, a large, triumphant, glowing human immune cell (e.g., a macrophage) stands victorious. The overall mood is one of overwhelming defeat for the bacteria.",
            options: [
                { text: "다시 시뮬레이션하기", nextStep: 'start' }
            ]
        }
    ];

    function findScenario(id) {
        return scenarioData.find(scenario => scenario.id === id);
    }

    function updateBacteriaCount(effect) {
        if (effect) {
            currentBacteriaCount = Math.max(0, Math.round(currentBacteriaCount * (1 + effect)));
        }
        currentBacteriaCountSpan.textContent = currentBacteriaCount;
    }

    // 이미지를 생성하고 표시하는 함수 (가상)
    function displayImage(promptText) {
        imagePlaceholder.innerHTML = ''; // 기존 이미지 제거
        if (promptText) {
            // 실제 환경에서는 여기에 이미지 생성 API 호출 로직이 들어갑니다.
            // 지금은 임시로 텍스트와 함께 플레이스홀더 이미지를 사용합니다.
            const img = document.createElement('img');
            // GitHub Pages에서는 이미지 URL을 직접 연결해야 합니다.
            // 이 부분은 사용자가 직접 이미지를 업로드하고 URL을 설정해야 합니다.
            // 여기서는 임시로 특정 키워드에 따라 다른 이미지를 보여주도록 설정합니다.
            
            let imageUrl = '';
            if (promptText.includes('Staphylococcus aureus bacterium') && promptText.includes('human body')) {
                imageUrl = 'https://i.ibb.co/V3Y26zM/The-Microbes-Journey.png'; // Start
            } else if (promptText.includes('intact human skin')) {
                imageUrl = 'https://i.ibb.co/L5h92d1/healthy-skin.png'; // Healthy Skin
            } else if (promptText.includes('jagged wound opening')) {
                imageUrl = 'https://i.ibb.co/f4n6p7h/injured-skin.png'; // Injured Skin
            } else if (promptText.includes('respiratory mucosal lining')) {
                imageUrl = 'https://i.ibb.co/5c0d51g/respiratory-mucosa.png'; // Respiratory Mucosa
            } else if (promptText.includes('stomach lining')) {
                imageUrl = 'https://i.ibb.co/Wc17904/digestive-mucosa.png'; // Digestive Mucosa
            } else if (promptText.includes('amoeba-like macrophage')) {
                imageUrl = 'https://i.ibb.co/0tJ2zP8/phagocytosis-1.png'; // Phagocytosis 1
            } else if (promptText.includes('blood vessel dilating')) {
                imageUrl = 'https://i.ibb.co/M9B7L27/phagocytosis-2.png'; // Phagocytosis 2 (inflammation pre-stage)
            } else if (promptText.includes('inflamed tissue')) {
                imageUrl = 'https://i.ibb.co/7C96n8J/inflammation.png'; // Inflammation
            } else if (promptText.includes('defeated-looking, very small Staphylococcus aureus bacterium')) {
                imageUrl = 'https://i.ibb.co/x7R5D20/final-result.png'; // Final Result
            } else {
                imageUrl = 'https://via.placeholder.com/600x400?text=Image+Loading...'; // 기본 플레이스홀더
            }

            img.src = imageUrl;
            img.alt = promptText; // 접근성을 위해 alt 텍스트 추가
            imagePlaceholder.appendChild(img);
        } else {
            imagePlaceholder.innerHTML = '<p>이미지가 없습니다.</p>';
        }
    }


    function renderScenario(scenarioId) {
        const scenario = findScenario(scenarioId);
        if (!scenario) {
            console.error('Scenario not found:', scenarioId);
            return;
        }

        currentScenarioId = scenarioId;

        // 세균 수 업데이트
        updateBacteriaCount(scenario.bacteriaEffect);

        // 메시지 표시 (세균 수 동적 업데이트 포함)
        let displayMessage = scenario.message;
        if (scenarioId === 'start') {
            displayMessage = displayMessage.replace("<span id='bacteria-count-start'></span>", `<span class='keywords'>${currentBacteriaCount}</span>`);
        } else if (scenarioId === 'respiratoryMucosa') {
            displayMessage = displayMessage.replace("<span id='bacteria-count-resp'></span>", `<span class='keywords'>${currentBacteriaCount}</span>`);
        } else if (scenarioId === 'digestiveMucosa') {
            displayMessage = displayMessage.replace("<span id='bacteria-count-digest'></span>", `<span class='keywords'>${currentBacteriaCount}</span>`);
        } else if (scenarioId === 'phagocytosis') {
            displayMessage = displayMessage.replace("<span id='bacteria-count-phago'></span>", `<span class='keywords'>${currentBacteriaCount}</span>`);
        } else if (scenarioId === 'inflammation') {
            displayMessage = displayMessage.replace("<span id='bacteria-count-inflam'></span>", `<span class='keywords'>${currentBacteriaCount}</span>`);
        } else if (scenarioId === 'finalResult') {
            const initialBacteria = 1000;
            const infectionRate = ((currentBacteriaCount / initialBacteria) * 100).toFixed(2);
            displayMessage = displayMessage.replace("<span id='final-infection-rate'></span>", `<span class='keywords'>${infectionRate}</span>`);
        }
        messageText.innerHTML = displayMessage;

        // 이미지 표시
        displayImage(scenario.imagePrompt);
        if (scenario.imagePrompt2 && scenarioId === 'phagocytosis') { // phagocytosis 시나리오에서 두 번째 이미지도 표시
            // 두 번째 이미지를 위한 별도의 placeholder를 만들거나, 기존 placeholder에 추가 로직 구현
            // 여기서는 간단히 첫 번째 이미지 로드 후 짧은 지연 뒤 두 번째 이미지를 보여주는 것으로 구현
            setTimeout(() => {
                displayImage(scenario.imagePrompt2);
            }, 3000); // 3초 후 두 번째 이미지 로드 (조절 가능)
        }


        // 옵션 버튼 생성
        optionsContainer.innerHTML = '';
        if (scenario.options) {
            scenario.options.forEach(option => {
                const button = document.createElement('button');
                button.classList.add('option-button');
                button.textContent = option.text;
                button.addEventListener('click', () => {
                    if (option.nextStep === 'start') { // '다시 시뮬레이션하기' 선택 시 초기화
                        currentBacteriaCount = 1000;
                    }
                    renderScenario(option.nextStep);
                });
                optionsContainer.appendChild(button);
            });
        } else if (scenario.nextStep) {
            // 옵션이 없고 nextStep만 있는 경우, 자동으로 다음 단계로 진행 (버튼 클릭 없이)
            // 사용자에게 다음 단계로 넘어간다는 것을 알리는 메시지나 지연 효과 추가 가능
            setTimeout(() => {
                renderScenario(scenario.nextStep);
            }, 3000); // 3초 후 자동으로 다음 시나리오로 이동
        }
    }

    // 게임 시작
    renderScenario(currentScenarioId);
});