document.addEventListener('DOMContentLoaded', () => {
  const $imageGalery = document.querySelector('.image-galery');
  if ($imageGalery) {
    $imageGalery.addEventListener('click', e => {
      const $target = e.target;
      const $listClicked = $target.closest('.images-list');
      if (!$listClicked) return;
      const $imageWrapperClicked = $target.closest('.image');
      if (!$imageWrapperClicked) return;
      $listClicked.querySelectorAll('.image').forEach($image => {
        $image.classList.remove('active');
      })
      $imageWrapperClicked.classList.add('active');
      const $image = $imageWrapperClicked.querySelector('img');
      const $principalImage = $imageGalery.querySelector('.principal-image img');
      $principalImage.src = $image.src;
    })
  }

  document.addEventListener('click', e => {
    const $target = e.target;
    if ($target.matches('[data-back-button]')) {
      e.preventDefault();
      window.history.back();
    }
  })

})