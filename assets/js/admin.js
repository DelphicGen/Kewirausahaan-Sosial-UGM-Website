$(document).ready(function () {
    // let ckeditor = document.querySelector('.ckeditor');
    // if(ckeditor) CKEDITOR.replace('#ckeditor');
    // let config = {
    //     toolbar: [
    //         ['Font','FontSize'],
    //         ['Bold','Italic','Underline'],
    //         ['TextColor','BGColor'],
    //         ['JustifyLeft', 'JustifyCenter', 'JustifyRight']
    //     ],
    // };
    // $('.ckeditor').ckeditor(config);
    ClassicEditor
        .create( document.querySelector('.ckeditor'), {
            alignment: {
                options: [ 'left', 'right', 'center', 'justify' ]
            },
            toolbar: [
                'heading', '|', 'bulletedList', 'numberedList', 'alignment', 'undo', 'redo'
            ]
        })
        .then( editor => {
            CKEDITOR.replace(editor);
        } )
        .catch( error => {
                console.error( error );
        } );

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
            // $('.cropped_image').val(imgSrc)
            dwn.classList.remove('d-none');
            dwn.download = 'imagename';
            dwn.setAttribute('href',imgSrc);
        });

    }
  
  

});