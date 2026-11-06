import { prisma } from "../configs/prisma-client.js"

// import * as repo from "../repositories/brand-repo.js"

export async function getObject(id) {
    return await prisma.brands.findUnique(
        {where: {id: id}}
    )
}

export async function getAllObjects() {
    return await prisma.brands.findMany();
}

export async function updateObject(id, brand) {
    return await prisma.brands.update({
        where: {id: id},data: brand
    })
}

export async function removeObject(id) {
    return await prisma.brands.delete({where: {id: id}})
}

export async function createObject(data) {
    return await prisma.brands.create({data: data})
}
