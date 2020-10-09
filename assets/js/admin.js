$(document).ready(function () {
    let ckeditor = document.querySelector('.ckeditor')
    if(ckeditor) CKEDITOR.replace('#ckeditor');

    let result = document.querySelector('.result') && document.querySelector('.result'),
    img_result = document.querySelector('.img-result') && document.querySelector('.img-result'),
    img_w = 300,
    img_h = 200,
    save = document.querySelector('.save') && document.querySelector('.save'),
    dwn = document.querySelector('.download') && document.querySelector('.download'),
    cropped = document.querySelector('.cropped') && document.querySelector('.cropped'),
    upload = document.querySelector('.upload') && document.querySelector('.upload'),
    cropper = '';

    if(upload) {
        upload.addEventListener('change', (e) => {
            if (e.target.files.length) {
                const reader = new FileReader();
                reader.onload = (e)=> {
                    if(e.target.result){
                        let img = document.createElement('img');
                        img.id = 'image';
                        img.src = e.target.result
                        result.innerHTML = '';
                        result.appendChild(img);
                        save.classList.remove('d-none');
                        cropper = new Cropper(img);
                    }
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        save.addEventListener('click',(e)=>{
            e.preventDefault();
            let imgSrc = cropper.getCroppedCanvas({
                width: img_w
            }).toDataURL();
            cropped.classList.remove('d-none');
            img_result.classList.remove('d-none');
            cropped.src = imgSrc;
            dwn.classList.remove('d-none');
            dwn.download = 'imagename';
            dwn.setAttribute('href',imgSrc);
        });

    }
    
    const select = document.querySelector('.adminDashboard__select');
    let selectValue = localStorage.getItem('table') ? localStorage.getItem('table') : 'mentor';
    const hideTables = document.querySelectorAll('.hideTable');
    let tableName;

    select.value = selectValue;

    hideTables.forEach(table => {
        tableName = table.classList[0];
        if(tableName === `${selectValue}Table`) {
            table.classList.remove('hideTable')
        }
    })

    const handleSelectChange = () => {
        document.querySelector(`.${selectValue}Table`).classList.add('hideTable');
        selectValue = select.value;
        localStorage.setItem('table', selectValue);
        document.querySelector(`.${selectValue}Table`).classList.remove('hideTable');
    }

    select.addEventListener('change', handleSelectChange);
});