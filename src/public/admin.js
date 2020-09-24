const deleteBtns = document.querySelectorAll('.delete');

deleteBtns.forEach((button) => {
  button.addEventListener('click', async (event) => {
    const cardBody = event.target.parentNode;
    const _id = cardBody.querySelector('[name=_id]').value;
    const _csrf = cardBody.querySelector('[name=_csrf]').value;

    try {
      const result = await fetch(`/admin/delete/${_id}`, {
        method: 'DELETE',
        headers: {
          'csrf-token': _csrf,
        },
      });
      const resultJSON = await result.json();
      if (result.status !== 200) throw new Error(resultJSON.message);
    } catch (error) {
      console.log(error);
      return;
    }
    cardBody.parentNode.remove();
  });
});
