#!/bin/bash
# Script para resolver migración fallida
# Ejecutar en Railway CLI: railway run bash fix-migration.sh

npx prisma migrate resolve --rolled-back "20260201161218_add_organizations"
npx prisma migrate deploy
