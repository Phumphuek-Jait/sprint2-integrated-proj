async function getItems(url) {
  const res = await fetch(url)

  if (!res.ok)
    throw new Error(`Fail to get items: ${res.status} ${res.statusText} `)

  return await res.json()
}

async function deleteItem(url, id) {
  const res = await fetch(`${url}/${id}`, {
    method: 'DELETE'
  })

  if (!res.ok)
    throw new Error(`Fail to delete item: ${res.status} ${res.statusText}`)
  return id
}

async function addItem(url, item) {
  const res = await fetch(`${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  })

  if (!res.ok)
    throw new Error(`Fail to add item: ${res.status} ${res.statusText}`)
  return await res.json()
}

async function editItem(url, item) {
  const res = await fetch(`${url}/${item.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  })
  if (!res.ok)
    throw new Error(`Fail to edit item: ${res.status} ${res.statusText}`)
  return await res.json()
}

export { getItems, deleteItem, addItem, editItem}
