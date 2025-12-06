  const form = document.getElementById('vehicleForm');
            const successMessage = document.getElementById('successMessage');

            // Máscaras para campos
            document.getElementById('placa').addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                if (value.length > 3) {
                    value = value.slice(0, 3) + '-' + value.slice(3, 7);
                }
                e.target.value = value;
            });

            document.getElementById('cpfProprietario').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                }
                e.target.value = value;
            });

            document.getElementById('telefoneProprietario').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            });

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(form);
                const vehicleData = {};
                
                formData.forEach((value, key) => {
                    vehicleData[key] = value;
                });

                console.log('Dados do Veículo:', vehicleData);

                successMessage.classList.add('show');
                
                setTimeout(() => {
                    successMessage.classList.remove('show');
                }, 3000);

                form.reset();

                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            });